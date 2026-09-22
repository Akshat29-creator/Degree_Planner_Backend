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

    # Performance & Speed Settings (Ultra-fast local inference)
    ollama_think: bool = False                       # Thinking mode OFF for instant responses
    ollama_num_ctx: int = 8192                       # 8K context: fits 100% on GPU VRAM without CPU spill
    ollama_num_predict: int = 4096                   # High max output tokens (do not decrease output)
    ollama_num_gpu: int = 99                         # Force 100% layers onto GPU
    ollama_num_thread: int = 8                       # Multi-threaded CPU evaluation
    ollama_num_batch: int = 512                      # Batch size for prompt processing throughput
    ollama_keep_alive: str = "60m"                   # Keep model hot in VRAM to avoid reload lag
    
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
