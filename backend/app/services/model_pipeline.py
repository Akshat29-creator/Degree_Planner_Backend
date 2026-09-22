"""
Model Pipeline Service — Unified Multi-Model Orchestrator

This is the single source of truth for all AI inference in the pipeline.
It wires together:
  • Model Router (intent → model selection)
  • RAG Service  (document retrieval for grounded responses)
  • Ollama API   (inference calls with dual-model strategy)

Key design rules:
  1. 8B model: keep_alive=-1 (always loaded) → minimal latency for /chat
  2. 14B model: keep_alive=300 (5 min auto-unload) → conserve VRAM when idle
  3. All quiz outputs are validated JSON — retried up to 2x on parse failure
  4. RAG context is injected as a SYSTEM boundary, not as user text
  5. No hallucination outside context: 14B is always told to refuse if context empty
"""
import json
import re
from typing import Optional
import httpx

from app.config import get_settings
from app.services.model_router import route_model, get_keep_alive
from app.services.rag_service import rag_service

settings = get_settings()

# ─────────────────────────────────────────────────────────────
# Shared Ollama call parameters (Optimized for 100% GPU VRAM & High Output)
# ─────────────────────────────────────────────────────────────
_FAST_OPTIONS = {
    "temperature": 0.3,
    "top_k": 40,
    "top_p": 0.9,
    "num_ctx": settings.ollama_num_ctx,
    "num_predict": settings.ollama_num_predict,
    "num_gpu": settings.ollama_num_gpu,
    "num_thread": settings.ollama_num_thread,
    "num_batch": settings.ollama_num_batch,
}

_REASONING_OPTIONS = {
    "temperature": 0.2,   # Lower for more deterministic analysis
    "top_k": 30,
    "top_p": 0.85,
    "num_ctx": settings.ollama_num_ctx,     # 8K context to fit 100% in GPU VRAM (no CPU offload)
    "num_predict": settings.ollama_num_predict, # Preserve full output capacity
    "num_gpu": settings.ollama_num_gpu,
    "num_thread": settings.ollama_num_thread,
    "num_batch": settings.ollama_num_batch,
}

# ─────────────────────────────────────────────────────────────
# System prompts per task type
# ─────────────────────────────────────────────────────────────
_CHAT_SYSTEM = """You are "Degree Planner Agent", an expert academic advisor.
Answer student questions clearly and concisely. Be supportive but direct.
If the question is outside your academic scope, say so briefly.
Do NOT fabricate course names, grades, or university policies."""

_ANALYZE_SYSTEM = """You are an expert academic content analyst.
You will receive DOCUMENT CONTEXT extracted from a student's study material.
Your job: provide a thorough, structured analysis.

RULES:
- Only reference information present in the provided context.
- If context is insufficient, say: "The document does not contain enough information."
- Be specific: cite concepts, topics, and key points from the document.
- Structure your output with clear sections."""

_ANALYZE_RAG_BOUNDARY = """
=== DOCUMENT CONTEXT (use ONLY this for your analysis) ===
{context}
=== END OF CONTEXT ===

QUESTION / TASK: {query}

Provide a structured analysis based ONLY on the above context."""

_QUIZ_SYSTEM = """You are a precise quiz generator for academic study materials.

CRITICAL OUTPUT RULE:
- Output ONLY valid JSON. No explanations. No extra text. No markdown.
- Start your response with {{ and end with }}
- Every question MUST have exactly 4 options (A, B, C, D format)
- The answer field MUST match one of the option strings exactly

JSON FORMAT (strict):
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A. ..."
    }
  ]
}"""

_QUIZ_PROMPT_TEMPLATE = """Generate {num_questions} multiple-choice quiz questions about: {topic}

{context_block}

Requirements:
- Each question must test conceptual understanding, not just memorization.
- Include 1 easy, {mid} medium, and 1 hard question in the mix.
- Distractors (wrong options) must be plausible but clearly incorrect.
- Output ONLY the JSON object. Nothing else."""

_EVAL_SYSTEM = """You are an academic performance evaluator.
Analyze student quiz answers and provide structured, actionable feedback.

Be constructive and specific. Always output valid JSON only."""

# ─────────────────────────────────────────────────────────────
# Core Pipeline Service
# ─────────────────────────────────────────────────────────────
class ModelPipelineService:
    """Orchestrates all AI inference through the dual-model pipeline."""

    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.generate_url = f"{self.base_url}/api/generate"
        self.fast_model = settings.ollama_fast_model
        self.reasoning_model = settings.ollama_reasoning_model
        self.timeout = 300.0  # 5 min for heavy 14B tasks on long documents

    # ─────────────────────────────────────
    # Internal: Ollama API call
    # ─────────────────────────────────────
    async def _call_ollama(
        self,
        prompt: str,
        system: str,
        model: str,
        options: Optional[dict] = None,
    ) -> Optional[str]:
        """Make a single inference call to Ollama."""
        keep_alive = get_keep_alive(model)
        payload = {
            "model": model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "think": settings.ollama_think,  # Disable chain-of-thought for fast inference
            "keep_alive": keep_alive,
            "options": options or _FAST_OPTIONS,
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.generate_url, json=payload)
                if response.status_code != 200:
                    print(f"[Pipeline] Ollama error {response.status_code}: {response.text[:200]}")
                    return None
                return response.json().get("response", "")
        except httpx.ConnectError:
            print("[Pipeline] Ollama not running. Start with: ollama serve")
            return None
        except httpx.TimeoutException:
            print(f"[Pipeline] Timeout calling {model}. Consider reducing context or prompt length.")
            return None
        except Exception as e:
            print(f"[Pipeline] Exception: {e}")
            return None

    # ─────────────────────────────────────
    # Internal: JSON extraction + validation
    # ─────────────────────────────────────
    def _extract_json(self, text: str) -> Optional[dict]:
        """Extract and parse JSON from model output. Handles markdown fences."""
        if not text:
            return None
        # Strip <think>...</think> tags if they exist
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
        # Also strip "Thinking..." if it appears as plain text
        text = re.sub(r"(?i)thinking\.\.\.", "", text)
        
        # Strip markdown code fences
        text = re.sub(r"```(?:json)?", "", text).strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        # Find outermost JSON object
        depth = 0
        start = -1
        for i, ch in enumerate(text):
            if ch == "{":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0 and start != -1:
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        pass
        print(f"[Pipeline] JSON extraction failed. Raw:\n{text[:400]}")
        return None

    # ─────────────────────────────────────
    # 1. CHAT — qwen3:8b (always loaded)
    # ─────────────────────────────────────
    async def chat(self, message: str, history: list[dict]) -> dict:
        """
        General chat using the fast 8B model.
        Conversation history is formatted into the prompt for context continuity.
        Auto-upgrades to 14B for reasoning-heavy messages.
        """
        model = route_model(message)
        options = _REASONING_OPTIONS if model == self.reasoning_model else _FAST_OPTIONS

        # Format history into prompt
        history_text = ""
        for turn in history[-6:]:  # Last 6 turns (3 exchanges)
            role = "Student" if turn.get("role") == "user" else "Advisor"
            history_text += f"{role}: {turn.get('content', '')}\n"

        prompt = f"{history_text}Student: {message}\nAdvisor:"

        raw = await self._call_ollama(prompt, _CHAT_SYSTEM, model, options)
        return {
            "response": (raw or "I'm having trouble connecting to the AI. Please try again.").strip(),
            "model_used": model,
        }

    # ─────────────────────────────────────
    # 2. ANALYZE — qwen3:14b + RAG
    # ─────────────────────────────────────
    async def analyze_document(
        self,
        text: str,
        doc_id: Optional[str] = None,
        query: str = "Give a comprehensive analysis of this document",
    ) -> dict:
        """
        Deep document analysis using 14B + RAG context retrieval.

        The document is indexed once. Subsequent calls with same doc_id
        skip re-indexing (fast path).
        """
        # Index document (idempotent)
        actual_doc_id = await rag_service.index_document(text, doc_id)

        # Retrieve top-k relevant context for the query
        context = await rag_service.retrieve_context(query, actual_doc_id)
        chunks_retrieved = len(context.split("---")) if context else 0

        if not context:
            # Fallback: use raw text truncated if RAG fails
            context = text[:4000]
            print("[Pipeline] RAG context empty, using raw text fallback.")

        prompt = _ANALYZE_RAG_BOUNDARY.format(context=context, query=query)
        raw = await self._call_ollama(prompt, _ANALYZE_SYSTEM, self.reasoning_model, _REASONING_OPTIONS)

        return {
            "analysis": (raw or "Analysis failed — check Ollama connection.").strip(),
            "doc_id": actual_doc_id,
            "model_used": self.reasoning_model,
            "chunks_retrieved": chunks_retrieved,
        }

    # ─────────────────────────────────────
    # 3. GENERATE QUIZ — qwen3:14b + RAG
    # ─────────────────────────────────────
    async def generate_quiz(
        self,
        topic: str,
        doc_id: Optional[str] = None,
        num_questions: int = 5,
    ) -> dict:
        """
        Generate a strict JSON quiz using the 14B model.

        If doc_id is provided, questions are grounded in RAG-retrieved content.
        Retries up to 2 times on JSON parse failure.
        """
        context_block = ""
        if doc_id and rag_service.is_indexed(doc_id):
            context = await rag_service.retrieve_context(
                f"key concepts and facts about {topic}", doc_id
            )
            if context:
                context_block = f"""
=== DOCUMENT CONTEXT (base questions on this ONLY) ===
{context}
=== END OF CONTEXT ===
"""

        mid_count = max(1, num_questions - 2)
        prompt = _QUIZ_PROMPT_TEMPLATE.format(
            num_questions=num_questions,
            topic=topic,
            context_block=context_block,
            mid=mid_count,
        )

        # Retry loop for JSON reliability
        for attempt in range(3):
            raw = await self._call_ollama(prompt, _QUIZ_SYSTEM, self.reasoning_model, _REASONING_OPTIONS)
            parsed = self._extract_json(raw or "")
            if parsed and "questions" in parsed:
                questions = parsed["questions"]
                # Validate and clean each question
                validated = []
                for q in questions:
                    if (
                        isinstance(q.get("question"), str)
                        and isinstance(q.get("options"), list)
                        and len(q["options"]) == 4
                        and isinstance(q.get("answer"), str)
                    ):
                        validated.append({
                            "question": q["question"].strip(),
                            "options": [str(o).strip() for o in q["options"]],
                            "answer": q["answer"].strip(),
                        })
                if validated:
                    return {
                        "questions": validated,
                        "model_used": self.reasoning_model,
                        "topic": topic,
                    }
            print(f"[Pipeline] Quiz JSON parse attempt {attempt+1}/3 failed, retrying...")

        return {"error": "Failed to generate valid quiz JSON after 3 attempts. Try a more specific topic."}

    # ─────────────────────────────────────
    # 4. EVALUATE — qwen3:14b
    # ─────────────────────────────────────
    async def evaluate_performance(
        self,
        student_answers: list[dict],
        subject: Optional[str] = None,
        history: list[dict] = None,
    ) -> dict:
        """
        Evaluate student answers and provide structured feedback using 14B.

        Input format (student_answers):
          [{"question": "...", "selected": "A. ...", "correct": "B. ..."}]
        """
        if not student_answers:
            return {"error": "No answers provided for evaluation."}

        # Calculate raw score
        correct_count = sum(
            1 for a in student_answers
            if a.get("selected", "").strip() == a.get("correct", "").strip()
        )
        total = len(student_answers)
        score_pct = round((correct_count / total) * 100, 1)

        # Format answers for prompt
        answers_text = "\n".join([
            f"{i+1}. Q: {a.get('question', 'N/A')}\n"
            f"   Selected: {a.get('selected', 'N/A')}\n"
            f"   Correct:  {a.get('correct', 'N/A')}\n"
            f"   {'✓ Correct' if a.get('selected') == a.get('correct') else '✗ Wrong'}"
            for i, a in enumerate(student_answers)
        ])

        subject_line = f"Subject: {subject}" if subject else ""
        prompt = f"""Evaluate this student's quiz performance:

{subject_line}
Score: {correct_count}/{total} ({score_pct}%)

ANSWERS:
{answers_text}

Respond ONLY with this JSON:
{{
  "score": {score_pct},
  "grade": "A/B/C/D/F",
  "feedback": "2-3 sentences of overall feedback",
  "weak_topics": ["Topic A from wrong answers", "Topic B"],
  "recommendations": [
    "Specific action 1",
    "Specific action 2",
    "Specific action 3"
  ]
}}"""

        for attempt in range(2):
            raw = await self._call_ollama(prompt, _EVAL_SYSTEM, self.reasoning_model, _REASONING_OPTIONS)
            parsed = self._extract_json(raw or "")
            if parsed and "feedback" in parsed:
                return {
                    "score": float(parsed.get("score", score_pct)),
                    "grade": str(parsed.get("grade", _score_to_grade(score_pct))),
                    "feedback": str(parsed.get("feedback", "")).strip(),
                    "weak_topics": list(parsed.get("weak_topics", [])),
                    "recommendations": list(parsed.get("recommendations", [])),
                    "model_used": self.reasoning_model,
                }
            print(f"[Pipeline] Eval JSON parse attempt {attempt+1}/2 failed, retrying...")

        # Fallback (structured without AI narrative)
        return {
            "score": score_pct,
            "grade": _score_to_grade(score_pct),
            "feedback": f"You scored {correct_count}/{total}. Review the incorrect answers to improve.",
            "weak_topics": [],
            "recommendations": ["Review incorrect questions carefully.", "Practice similar problems."],
            "model_used": self.reasoning_model,
        }

    # ─────────────────────────────────────
    # Health check
    # ─────────────────────────────────────
    async def health_check(self) -> dict:
        """Ping Ollama and return model availability status."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    models_raw = response.json().get("models", [])
                    available = [m.get("name", "") for m in models_raw]
                    return {
                        "ollama": "online",
                        "fast_model": self.fast_model,
                        "fast_model_available": any(self.fast_model in m for m in available),
                        "reasoning_model": self.reasoning_model,
                        "reasoning_model_available": any(self.reasoning_model in m for m in available),
                        "embed_model": settings.ollama_embed_model,
                        "embed_model_available": any(settings.ollama_embed_model in m for m in available),
                        "available_models": available,
                    }
        except Exception:
            pass
        return {
            "ollama": "offline",
            "fast_model": self.fast_model,
            "fast_model_available": False,
            "reasoning_model": self.reasoning_model,
            "reasoning_model_available": False,
        }


# ─────────────────────────────────────────────────────────────
# Grade helper
# ─────────────────────────────────────────────────────────────
def _score_to_grade(score: float) -> str:
    if score >= 90: return "A"
    if score >= 80: return "B"
    if score >= 70: return "C"
    if score >= 60: return "D"
    return "F"


# Singleton
pipeline_service = ModelPipelineService()
