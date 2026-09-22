"""
Degree Planner Agent - FastAPI Backend

A production-grade API for intelligent degree planning with:
- Course management
- AI-powered plan generation
- Risk assessment
- Calendar export
"""
import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.utils.cache import init_redis, close_redis
from app.routers import courses_router, planner_router, ai_router, auth_router, revision_router, history_router, manual_entry_router, practice_router, flags_router, transcript_router, gpa_router
from app.routers.assessment import router as assessment_router
from app.routers.performance import router as performance_router
from app.routers.pipeline import router as pipeline_router  # Multi-model AI pipeline

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle - initialize database on startup."""
    print("[START] Starting Degree Planner API...")
    await init_db()
    await init_redis()
    print("[OK] Database and Redis initialized")
    # Warm up the fast model so first request has no cold-start delay
    try:
        from app.services.model_pipeline import pipeline_service
        warmup = await pipeline_service.health_check()
        if warmup.get("ollama") == "online":
            print(f"[AI] Ollama online — fast: {warmup.get('fast_model_available')}, reasoning: {warmup.get('reasoning_model_available')}")
        else:
            print("[WARN] Ollama not running — start with: ollama serve")
    except Exception as e:
        print(f"[WARN] Model warm-up skipped: {e}")
    yield
    print("[STOP] Shutting down...")
    await close_redis()


app = FastAPI(
    title="Degree Planner Agent API",
    description="""
    AI-powered academic planning API that helps students optimize their degree journey.
    
    ## Features
    - 📚 Course management with prerequisite tracking
    - 🧠 Intelligent plan generation with workload balancing
    - 🎯 Priority course scheduling
    - 📊 Semester difficulty ratings
    - ⚠️ Risk analysis (burnout & graduation)
    - 🤖 AI-powered career advice
    - 📅 Calendar export (ICS)
    - 📄 Document analysis for revision planning
    - 📜 Plan history tracking
    - ✏️ Manual course entry with AI analysis
    - 📝 Practice & Self-Test engine
    """,
    version="2.1.0",
    lifespan=lifespan,
)

# CORS middleware for frontend - HARDCODED for reliability
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses_router, prefix="/api")
app.include_router(planner_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(auth_router, prefix="/api")  # /api/auth/*
app.include_router(revision_router, prefix="/api")  # /api/revision/*
app.include_router(history_router, prefix="/api")  # /api/history/*
app.include_router(manual_entry_router, prefix="/api")  # /api/manual-entry/*
app.include_router(practice_router, prefix="/api")  # /api/practice/*
app.include_router(flags_router, prefix="/api")  # /api/flags - Developer Tools
app.include_router(assessment_router, prefix="/api") # /api/assessment/*
app.include_router(performance_router, prefix="/api") # /api/performance/*
app.include_router(pipeline_router, prefix="/api")   # /api/pipeline/* ← Multi-model pipeline
app.include_router(transcript_router, prefix="/api") # /api/transcript/* ← Transcript Import (Option D)
app.include_router(gpa_router, prefix="/api") # /api/gpa/* ← GPA Simulator (Option E)



@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": "2.2.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    from app.utils.cache import redis_client
    return {
        "status": "healthy",
        "database": "connected",
        "redis_cache": "connected" if redis_client else "unavailable",
        "ai_mode": "local (Ollama)"
    }
