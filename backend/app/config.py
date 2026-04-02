"""Application configuration using Pydantic settings."""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://planner:plannerdev@localhost:5432/degree_planner"
    
    # Ollama - Local AI (NO cloud APIs)
    ollama_base_url: str = "http://127.0.0.1:11434"

    # Dual-model routing
    ollama_fast_model: str = "qwen3:8b-q4_K_M"       # Always-loaded, GPU-only
    ollama_reasoning_model: str = "qwen3:8b-q4_K_M"  # Consistent with 8B preference
    ollama_embed_model: str = "nomic-embed-text"      # Embeddings for RAG

    # Legacy alias — kept for backwards compat (points to fast model)
    ollama_model: str = "qwen3:8b-q4_K_M"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
    
    # App
    app_name: str = "Degree Planner Agent"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
