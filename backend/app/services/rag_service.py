"""
RAG Pipeline Service — Retrieval-Augmented Generation

Provides document indexing and context retrieval for the Degree Planner Agent.

Design decisions:
  • Uses Ollama's native /api/embed endpoint with "nomic-embed-text" model
    (no LlamaIndex cloud dependency — stays fully local)
  • In-memory vector store keyed by doc_id (fast, zero setup)
  • chunk_size=600, overlap=100 for optimal RAG accuracy on academic docs
  • top_k=5 retrieved chunks per query
  • Cosine similarity for ranking

For production at scale: swap _VectorStore with ChromaDB by replacing
_store_chunks() and _similarity_search() implementations.
"""
import math
import asyncio
import hashlib
from typing import Optional
import httpx

from app.config import get_settings

settings = get_settings()

# ─────────────────────────────────────────────────────────────
# Chunking parameters (tuned for academic PDFs/PPTs)
# ─────────────────────────────────────────────────────────────
CHUNK_SIZE = 600      # characters per chunk
CHUNK_OVERLAP = 100   # overlap to preserve context across boundaries
TOP_K = 5             # chunks to retrieve per query


# ─────────────────────────────────────────────────────────────
# In-Memory Vector Store
# ─────────────────────────────────────────────────────────────
class _VectorStore:
    """
    Lightweight cosine-similarity vector store, keyed by doc_id.

    Structure:
      { doc_id: [ {"text": str, "embedding": List[float]} ] }
    """

    def __init__(self):
        self._index: dict[str, list[dict]] = {}

    def upsert(self, doc_id: str, chunks: list[dict]) -> None:
        """Replace all chunks for a document."""
        self._index[doc_id] = chunks

    def get_chunks(self, doc_id: str) -> list[dict]:
        return self._index.get(doc_id, [])

    def delete(self, doc_id: str) -> None:
        self._index.pop(doc_id, None)

    def has(self, doc_id: str) -> bool:
        return doc_id in self._index and len(self._index[doc_id]) > 0


# Singleton store instance
_store = _VectorStore()


# ─────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────
def _chunk_text(text: str) -> list[str]:
    """
    Split text into overlapping chunks.
    Tries to split on sentence boundaries first, falls back to hard split.
    """
    chunks: list[str] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + CHUNK_SIZE, text_len)

        # Try to break at the nearest period/newline before hard boundary
        if end < text_len:
            for sep in ["\n\n", "\n", ". ", " "]:
                sep_idx = text.rfind(sep, start, end)
                if sep_idx > start:
                    end = sep_idx + len(sep)
                    break

        chunks.append(text[start:end].strip())
        start = end - CHUNK_OVERLAP  # slide back by overlap

    return [c for c in chunks if c]  # drop empty chunks


def _cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


def _make_doc_id(text: str) -> str:
    """Generate a stable ID for a document from its content hash."""
    return hashlib.sha256(text[:500].encode()).hexdigest()[:16]


# ─────────────────────────────────────────────────────────────
# Core RAG Service
# ─────────────────────────────────────────────────────────────
class RAGService:
    """
    Manages document embedding, storage, and context retrieval.

    Usage:
        rag = RAGService()
        doc_id = await rag.index_document(text)
        context = await rag.retrieve_context("What is gradient descent?", doc_id)
    """

    def __init__(self):
        self.embed_url = f"{settings.ollama_base_url}/api/embed"
        self.embed_model = settings.ollama_embed_model
        self.timeout = 60.0

    async def _embed_text(self, text: str) -> Optional[list[float]]:
        """Call Ollama /api/embed to get a vector for text."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.embed_url,
                    json={"model": self.embed_model, "input": text},
                )
                if response.status_code != 200:
                    print(f"[RAG] Embed error {response.status_code}: {response.text[:200]}")
                    return None
                data = response.json()
                # Ollama returns {"embeddings": [[...float...]]}
                embeddings = data.get("embeddings") or data.get("embedding")
                if not embeddings:
                    return None
                # Handle both list-of-lists and flat list
                return embeddings[0] if isinstance(embeddings[0], list) else embeddings
        except Exception as e:
            print(f"[RAG] Embed exception: {e}")
            return None

    async def _embed_batch(self, texts: list[str]) -> list[Optional[list[float]]]:
        """Embed multiple texts concurrently."""
        tasks = [self._embed_text(t) for t in texts]
        return await asyncio.gather(*tasks)

    async def index_document(self, text: str, doc_id: Optional[str] = None) -> str:
        """
        Chunk and embed a document, storing it in the vector store.

        Args:
            text: Raw extracted text from PDF/PPT.
            doc_id: Optional stable ID. Auto-generated from content hash if omitted.

        Returns:
            doc_id (use this for later retrieval).
        """
        if not doc_id:
            doc_id = _make_doc_id(text)

        # Skip re-indexing if already stored
        if _store.has(doc_id):
            print(f"[RAG] doc_id={doc_id} already indexed, skipping.")
            return doc_id

        chunks = _chunk_text(text)
        print(f"[RAG] Indexing {len(chunks)} chunks for doc_id={doc_id}")

        # Embed all chunks concurrently
        embeddings = await self._embed_batch(chunks)

        stored: list[dict] = []
        for chunk_text, embedding in zip(chunks, embeddings):
            if embedding is not None:
                stored.append({"text": chunk_text, "embedding": embedding})
            else:
                print(f"[RAG] Warning: failed to embed a chunk, skipping.")

        _store.upsert(doc_id, stored)
        print(f"[RAG] Stored {len(stored)}/{len(chunks)} chunks for doc_id={doc_id}")
        return doc_id

    async def retrieve_context(self, query: str, doc_id: str, top_k: int = TOP_K) -> str:
        """
        Retrieve the top-k most relevant chunks for a query.

        Returns:
            Concatenated context string ready to inject into an LLM prompt.
        """
        chunks = _store.get_chunks(doc_id)
        if not chunks:
            return ""

        query_embedding = await self._embed_text(query)
        if query_embedding is None:
            # Fallback: return first top_k chunks (no ranking)
            return "\n\n---\n\n".join(c["text"] for c in chunks[:top_k])

        # Score all chunks
        scored = [
            (c["text"], _cosine_similarity(query_embedding, c["embedding"]))
            for c in chunks
        ]
        scored.sort(key=lambda x: x[1], reverse=True)

        top_chunks = [text for text, score in scored[:top_k] if score > 0.1]

        if not top_chunks:
            # No relevant chunks found — return empty to prevent hallucination
            return ""

        context = "\n\n---\n\n".join(top_chunks)
        return context

    def clear_index(self, doc_id: str) -> None:
        """Remove a document from the vector store (e.g. after session ends)."""
        _store.delete(doc_id)
        print(f"[RAG] Cleared index for doc_id={doc_id}")

    def is_indexed(self, doc_id: str) -> bool:
        """Check whether a document is already indexed."""
        return _store.has(doc_id)


# Singleton instance for the app
rag_service = RAGService()
