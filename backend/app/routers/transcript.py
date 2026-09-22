"""
Transcript Router - Option D: Transcript / PDF Course Extraction

Allows students to import completed coursework from:
  1. POST /api/transcript/upload  — upload a PDF transcript
  2. POST /api/transcript/parse-text — paste raw transcript text

Both endpoints extract text (PyMuPDF for PDFs, raw string for paste),
then call the local Ollama fast model to parse degree program and
completed courses, mapping them against the active course catalog.

All processing is 100% local — no cloud APIs are used.
"""
import re
import io
from typing import List, Optional

import fitz  # PyMuPDF
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.course import Course
from app.services.ollama_service import OllamaService
from app.config import get_settings
from app.routers.flags import feature_guard

settings = get_settings()

router = APIRouter(
    prefix="/transcript",
    tags=["Transcript Import"],
    dependencies=[Depends(feature_guard("transcript_import"))],
)


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class ParsedCourse(BaseModel):
    """A single course parsed from a transcript."""
    code: str = Field(..., description="Normalised course code, e.g. CS101")
    name: str = Field(..., description="Full course name from transcript")
    credits: Optional[float] = Field(None, description="Credit hours, if present")
    grade: Optional[str] = Field(None, description="Grade received, e.g. A, B+, Pass")
    term: Optional[str] = Field(None, description="Term taken, e.g. Fall 2023")
    matched_in_catalog: bool = Field(False, description="True if code exists in the course catalog DB")


class TranscriptParseResponse(BaseModel):
    """Structured result returned to the frontend after transcript parsing."""
    degree_program: Optional[str] = Field(None, description="Detected degree/program name")
    parsed_courses: List[ParsedCourse] = Field(default_factory=list)
    unmatched_raw: List[str] = Field(
        default_factory=list,
        description="Raw course strings the LLM found but could not map to a catalog code",
    )
    total_credits: float = Field(0.0, description="Sum of all extracted course credits")
    extraction_method: str = Field(..., description="'pdf_text' or 'raw_text'")
    raw_text_preview: str = Field("", description="First 500 chars of extracted text (for debugging)")
    warnings: List[str] = Field(default_factory=list)


class RawTextRequest(BaseModel):
    """Request body for the paste-text endpoint."""
    text: str = Field(..., min_length=10, description="Raw transcript text pasted by the user")


# ============================================================
# HELPERS
# ============================================================

TRANSCRIPT_SYSTEM_PROMPT = """You are an academic transcript parser.
You receive raw transcript text and must extract structured information.
Respond ONLY with valid JSON — no markdown fences, no extra commentary.
Never hallucinate courses that are not in the provided text."""


def _build_parse_prompt(raw_text: str, catalog_codes: List[str]) -> str:
    """Build the Ollama prompt for structured transcript extraction."""
    catalog_hint = ", ".join(catalog_codes[:120])  # keep prompt short
    return f"""Parse the following academic transcript text and extract all completed/enrolled courses.

COURSE CATALOG CODES AVAILABLE (try to map extracted courses to these codes):
{catalog_hint}

TRANSCRIPT TEXT:
\"\"\"
{raw_text[:6000]}
\"\"\"

Instructions:
1. Detect the degree program or major if mentioned.
2. Extract every course found in the text.
3. For each course, infer the catalog code from the COURSE CATALOG CODES list above when possible.
   - Normalise spacing/case: "C S 101", "cs 101", "CS101" → "CS101"
   - If no match, use the raw code from the transcript.
4. Extract grade (letter grade or Pass/Fail), credits, and term if present.
5. Do NOT invent courses not present in the transcript.

Respond with ONLY this JSON structure:
{{
  "degree_program": "Bachelor of Science in Computer Science",
  "courses": [
    {{
      "code": "CS101",
      "name": "Introduction to Programming",
      "credits": 4,
      "grade": "A",
      "term": "Fall 2022"
    }},
    {{
      "code": "MA101",
      "name": "Calculus I",
      "credits": 4,
      "grade": "B+",
      "term": "Fall 2022"
    }}
  ]
}}
"""


async def _fetch_catalog_codes(db: AsyncSession) -> List[str]:
    """Return all course codes from the active catalog."""
    result = await db.execute(select(Course.code).order_by(Course.code))
    return [row[0] for row in result.all()]


def _extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from a PDF using PyMuPDF (fitz). Returns concatenated page text."""
    text_parts: List[str] = []
    try:
        with fitz.open(stream=io.BytesIO(file_bytes), filetype="pdf") as doc:
            for page in doc:
                text_parts.append(page.get_text("text"))
    except Exception as exc:
        raise ValueError(f"Failed to read PDF: {exc}") from exc
    return "\n".join(text_parts)


def _normalise_code(raw_code: str) -> str:
    """Strip spaces inside codes and upper-case: 'C S 101' → 'CS101'."""
    return re.sub(r"\s+", "", raw_code).upper()


async def _parse_transcript(
    raw_text: str,
    extraction_method: str,
    db: AsyncSession,
) -> TranscriptParseResponse:
    """Shared parsing logic used by both endpoints."""
    warnings: List[str] = []
    raw_preview = raw_text[:500]

    if not raw_text.strip():
        return TranscriptParseResponse(
            extraction_method=extraction_method,
            warnings=["Extracted text was empty. Make sure the PDF is not scanned/image-only."],
            raw_text_preview=raw_preview,
        )

    catalog_codes = await _fetch_catalog_codes(db)

    if not catalog_codes:
        warnings.append("Course catalog is empty — code matching is unavailable.")

    prompt = _build_parse_prompt(raw_text, catalog_codes)
    ollama = OllamaService()

    llm_raw = await ollama._call_ollama(
        prompt,
        system_instruction=TRANSCRIPT_SYSTEM_PROMPT,
        model=settings.ollama_fast_model,
        think=False,  # Deterministic JSON output — no chain-of-thought needed
    )
    parsed_json = ollama._extract_json(llm_raw) if llm_raw else None

    if not parsed_json:
        return TranscriptParseResponse(
            extraction_method=extraction_method,
            warnings=["AI parsing failed or Ollama is not running. Please ensure Ollama is active."],
            raw_text_preview=raw_preview,
        )

    degree_program: Optional[str] = parsed_json.get("degree_program")
    raw_courses: List[dict] = parsed_json.get("courses", [])

    catalog_set = set(catalog_codes)
    parsed_courses: List[ParsedCourse] = []
    unmatched_raw: List[str] = []
    total_credits: float = 0.0

    for c in raw_courses:
        raw_code = str(c.get("code", "")).strip()
        norm_code = _normalise_code(raw_code)
        name = str(c.get("name", "Unknown Course")).strip()
        credits_val = c.get("credits")
        grade = c.get("grade")
        term = c.get("term")

        try:
            credits_float = float(credits_val) if credits_val is not None else None
        except (ValueError, TypeError):
            credits_float = None
            warnings.append(f"Could not parse credits for {norm_code}: {credits_val!r}")

        in_catalog = norm_code in catalog_set

        if not in_catalog and raw_code:
            unmatched_raw.append(f"{raw_code} — {name}")

        pc = ParsedCourse(
            code=norm_code or raw_code,
            name=name,
            credits=credits_float,
            grade=str(grade) if grade else None,
            term=str(term) if term else None,
            matched_in_catalog=in_catalog,
        )
        parsed_courses.append(pc)
        if credits_float:
            total_credits += credits_float

    return TranscriptParseResponse(
        degree_program=degree_program,
        parsed_courses=parsed_courses,
        unmatched_raw=unmatched_raw,
        total_credits=round(total_credits, 1),
        extraction_method=extraction_method,
        raw_text_preview=raw_preview,
        warnings=warnings,
    )


# ============================================================
# ENDPOINTS
# ============================================================

@router.post(
    "/upload",
    response_model=TranscriptParseResponse,
    summary="Upload a PDF transcript for automatic course extraction",
    description=(
        "Upload a born-digital PDF transcript. Text is extracted via PyMuPDF and then "
        "parsed by the local Ollama model. Scanned PDFs without embedded text will return "
        "an empty-text warning — use the /parse-text endpoint with copy-pasted text instead."
    ),
)
async def upload_transcript(
    file: UploadFile = File(..., description="PDF transcript file"),
    db: AsyncSession = Depends(get_db),
):
    """Parse an uploaded PDF transcript and extract completed courses."""
    # Validate MIME type
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Only PDF files are supported. Received content type: {file.content_type}",
        )

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        raw_text = _extract_pdf_text(file_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    return await _parse_transcript(raw_text, extraction_method="pdf_text", db=db)


@router.post(
    "/parse-text",
    response_model=TranscriptParseResponse,
    summary="Parse raw pasted transcript text",
    description=(
        "Accepts raw text copied from a transcript (useful for scanned PDFs or "
        "PDFs with copy-protection). Parsed by the local Ollama model."
    ),
)
async def parse_transcript_text(
    request: RawTextRequest,
    db: AsyncSession = Depends(get_db),
):
    """Parse raw pasted transcript text and extract completed courses."""
    return await _parse_transcript(request.text, extraction_method="raw_text", db=db)


@router.get(
    "/status",
    summary="Check transcript import service status",
)
async def transcript_status(db: AsyncSession = Depends(get_db)):
    """Health-check: verify PyMuPDF and Ollama connectivity, return catalog size."""
    import httpx

    fitz_version = fitz.version[0]

    ollama_online = False
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            ollama_online = resp.status_code == 200
    except Exception:
        pass

    catalog_codes = await _fetch_catalog_codes(db)

    return {
        "service": "transcript_import",
        "pymupdf_version": fitz_version,
        "ollama_online": ollama_online,
        "fast_model": settings.ollama_fast_model,
        "catalog_courses": len(catalog_codes),
        "endpoints": [
            "POST /api/transcript/upload  — PDF file upload",
            "POST /api/transcript/parse-text — raw text paste",
        ],
    }
