"""
Model Router — Intelligent Intent-Based Routing

Routes each request to the appropriate Ollama model based on prompt intent:
  • qwen3:8b-q4_K_M  → fast responses, chat, Q&A, simple JSON
  • qwen3:14b-q4_K_M → document analysis, quiz generation, evaluation, deep reasoning

No LLM call is made here — pure keyword heuristics for zero-latency routing.
"""
import re
from app.config import get_settings

settings = get_settings()

# ─────────────────────────────────────────────────────────────
# Keywords that trigger the 14B reasoning model
# ─────────────────────────────────────────────────────────────
REASONING_TRIGGERS: set[str] = {
    "analyze", "analyse", "analysis",
    "generate quiz", "create quiz", "make quiz", "quiz from",
    "evaluate", "evaluation", "assess",
    "explain deeply", "deep explain", "in depth",
    "document", "pdf", "ppt", "pptx", "lecture",
    "performance", "progress", "improvement",
    "understand this", "summarize document", "summarise document",
    "what does this document", "key topics from",
    "breakdown", "deep dive",
}

# Cost threshold: token count above which we upgrade to 14B
# (long prompts = complex tasks, even without explicit keywords)
LONG_PROMPT_THRESHOLD = 800  # characters


def route_model(prompt: str, force_reasoning: bool = False) -> str:
    """
    Select the appropriate Ollama model based on prompt intent.

    Args:
        prompt: The user/system prompt text.
        force_reasoning: Always use the reasoning model (e.g. explcitly requested).

    Returns:
        Full model name string for the Ollama API.
    """
    if force_reasoning:
        return settings.ollama_reasoning_model

    prompt_lower = prompt.lower()
    tokens = re.split(r"[\s,;.!?]+", prompt_lower)
    token_set: set[str] = set(tokens)

    # Check for multi-word triggers first
    for trigger in REASONING_TRIGGERS:
        if " " in trigger:
            if trigger in prompt_lower:
                return settings.ollama_reasoning_model
        else:
            if trigger in token_set:
                return settings.ollama_reasoning_model

    # Long prompts also get the reasoning model (document-heavy context)
    if len(prompt) > LONG_PROMPT_THRESHOLD:
        return settings.ollama_reasoning_model

    return settings.ollama_fast_model


def is_reasoning_task(prompt: str) -> bool:
    """Convenience bool version of route_model."""
    return route_model(prompt) == settings.ollama_reasoning_model


def get_keep_alive(model: str) -> int | str:
    """
    Returns the keep_alive value for Ollama:
    Uses settings.ollama_keep_alive (default 60m) to keep models warm in VRAM
    and eliminate cold-start reload latency between user interactions.
    """
    return settings.ollama_keep_alive



# ─────────────────────────────────────────────────────────────
# Quick self-test (python -m app.services.model_router)
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_cases = [
        ("What is recursion?", False),
        ("Analyze my study plan for next semester", True),
        ("Generate quiz from this PDF", True),
        ("Evaluate my performance this week", True),
        ("Hi, how are you?", False),
        ("Explain deeply what neural networks are", True),
    ]
    for prompt, expected_reasoning in test_cases:
        result = is_reasoning_task(prompt)
        status = "✅" if result == expected_reasoning else "❌"
        model = route_model(prompt)
        print(f"{status} [{model.split(':')[0]}] {prompt[:60]}")
