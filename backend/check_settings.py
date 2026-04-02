from app.config import get_settings
settings = get_settings()
print(f"MODEL: {settings.ollama_model}")
print(f"FAST: {settings.ollama_fast_model}")
print(f"REASONING: {settings.ollama_reasoning_model}")
