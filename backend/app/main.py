"""
Degree Planner Agent - FastAPI Backend

A production-grade API for intelligent degree planning with:
- Course management
- AI-powered plan generation
- Risk assessment
- Calendar export
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import courses_router, planner_router, ai_router, auth_router, revision_router, history_router, manual_entry_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle - initialize database on startup."""
    print("🚀 Starting Degree Planner API...")
    await init_db()
    print("✅ Database initialized")
    yield
    print("👋 Shutting down...")


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
    """,
    version="2.0.0",
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


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": "2.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_mode": "local (Ollama)"
    }
