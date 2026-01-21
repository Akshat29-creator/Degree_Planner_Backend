"""
TTS Service for AI Interview Simulator.
Uses Indic Parler-TTS for high-quality voice synthesis in multiple Indian languages.

Model: ai4bharat/indic-parler-tts (from HuggingFace)
Supports: 22 Indian languages with pre-defined speaker voices.

Language → Speaker Mapping (per Indic Parler-TTS):
- Assamese → Amit
- Bengali → Arjun
- English → Thoma
- Gujarati → Yash
- Hindi → Rohit
- Kannada → Suresh
- Malayalam → Anjali
- Marathi → Sanjay
- Odia → Manas
- Punjabi → Divjot
- Tamil → Jaya
- Telugu → Prakash
"""
import os
import io
import base64
import torch
from typing import Optional
import soundfile as sf
import numpy as np

# Lazy loading to avoid slow startup
_model = None
_tokenizer = None
_description_tokenizer = None


def get_device():
    """Get the best available device (CUDA > CPU)."""
    if torch.cuda.is_available():
        return "cuda:0"
    return "cpu"


def load_tts_model():
    """
    Load the Indic Parler-TTS model.
    This downloads the model from HuggingFace on first run (~2.5GB).
    """
    global _model, _tokenizer, _description_tokenizer
    
    if _model is not None:
        return _model, _tokenizer, _description_tokenizer
    
    try:
        from parler_tts import ParlerTTSForConditionalGeneration, ParlerTTSConfig
        from transformers import AutoTokenizer
        from huggingface_hub import hf_hub_download
        import json
        
        print("[TTS] Loading Indic Parler-TTS model...")
        device = get_device()
        
        repo_id = "ai4bharat/indic-parler-tts"

        # Load model (downloads ~2.5GB on first run)
        try:
            _model = ParlerTTSForConditionalGeneration.from_pretrained(repo_id).to(device)
            print("[TTS] Default loading succeeded.")
        except (ValueError, TypeError) as e:
            print(f"[TTS] Default loading failed ({e}). using manual config fix...")
            # Manual config loading for newer parler-tts versions
            config_path = hf_hub_download(repo_id=repo_id, filename="config.json")
            with open(config_path, "r") as f:
                config_dict = json.load(f)
            
            config = ParlerTTSConfig(**config_dict)
            _model = ParlerTTSForConditionalGeneration.from_pretrained(repo_id, config=config).to(device)
            print("[TTS] Manual config loading succeeded.")
        
        # Load tokenizers
        _tokenizer = AutoTokenizer.from_pretrained(repo_id)
        _description_tokenizer = AutoTokenizer.from_pretrained(
            _model.config.text_encoder._name_or_path
        )
        
        print(f"[TTS] Model loaded on {device}")
        return _model, _tokenizer, _description_tokenizer
        
    except ImportError as e:
        print(f"[TTS] ERROR: parler-tts not installed. Run: pip install git+https://github.com/huggingface/parler-tts.git")
        raise e
    except Exception as e:
        print(f"[TTS] ERROR loading model: {e}")
        raise e


# ==========================================
# LANGUAGE → SPEAKER MAPPING (FIXED)
# ==========================================
# Indic Parler-TTS recommended speakers per language
LANGUAGE_SPEAKER_MAP = {
    "as": "Amit",       # Assamese
    "bn": "Arjun",      # Bengali
    "brx": "Bikram",    # Bodo
    "cg": "Bhanu",      # Chhattisgarhi
    "doi": "Karan",     # Dogri
    "en": "Thoma",      # English
    "gu": "Yash",       # Gujarati
    "hi": "Rohit",      # Hindi
    "kn": "Suresh",     # Kannada
    "ml": "Anjali",     # Malayalam
    "mni": "Laishram",  # Manipuri
    "mr": "Sanjay",     # Marathi
    "ne": "Amrita",     # Nepali
    "or": "Manas",      # Odia
    "pa": "Divjot",     # Punjabi
    "sa": "Aryan",      # Sanskrit
    "ta": "Jaya",       # Tamil
    "te": "Prakash",    # Telugu
}

# Language display names
LANGUAGE_NAMES = {
    "as": "Assamese",
    "bn": "Bengali",
    "brx": "Bodo",
    "cg": "Chhattisgarhi",
    "doi": "Dogri",
    "en": "English",
    "gu": "Gujarati",
    "hi": "Hindi",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mni": "Manipuri",
    "mr": "Marathi",
    "ne": "Nepali",
    "or": "Odia",
    "pa": "Punjabi",
    "sa": "Sanskrit",
    "ta": "Tamil",
    "te": "Telugu",
}


def get_speaker_for_language(language: str) -> str:
    """
    Get the recommended speaker for a language.
    Uses automatic selection - never exposed to user.
    """
    return LANGUAGE_SPEAKER_MAP.get(language, LANGUAGE_SPEAKER_MAP["en"])


def is_language_supported(language: str) -> bool:
    """Check if a language is supported by TTS."""
    return language in LANGUAGE_SPEAKER_MAP


def build_voice_description(speaker: str, language: str) -> str:
    """
    Build a natural voice description for Indic Parler-TTS.
    Short sentences, professional tone.
    """
    lang_name = LANGUAGE_NAMES.get(language, "English")
    
    # Professional interviewer voice description
    description = (
        f"{speaker} speaks clearly and professionally. "
        f"The voice is natural with {lang_name} accent. "
        f"Moderate pace, clear pronunciation, studio quality recording."
    )
    
    return description


async def synthesize_speech(
    text: str,
    language: str = "en"
) -> bytes:
    """
    Convert text to speech using Indic Parler-TTS.
    
    Speaker is automatically selected based on language.
    
    Args:
        text: Text to speak (keep short for natural output)
        language: Language code (en, hi, ta, te, bn, etc.)
        
    Returns:
        WAV audio bytes
    """
    # Check if language is supported
    if not is_language_supported(language):
        print(f"[TTS] Language '{language}' not supported, falling back to English")
        language = "en"
    
    model, tokenizer, description_tokenizer = load_tts_model()
    device = get_device()
    
    # Auto-select speaker for language (never exposed to user)
    speaker = get_speaker_for_language(language)
    
    # Build voice description
    description = build_voice_description(speaker, language)
    
    print(f"[TTS] Synthesizing: lang={language}, speaker={speaker}")
    
    # Tokenize inputs
    description_input_ids = description_tokenizer(
        description, return_tensors="pt"
    ).to(device)
    
    prompt_input_ids = tokenizer(
        text, return_tensors="pt"
    ).to(device)
    
    # Generate audio
    with torch.no_grad():
        generation = model.generate(
            input_ids=description_input_ids.input_ids,
            attention_mask=description_input_ids.attention_mask,
            prompt_input_ids=prompt_input_ids.input_ids,
            prompt_attention_mask=prompt_input_ids.attention_mask,
        )
    
    # Convert to numpy and create WAV
    audio_arr = generation.cpu().numpy().squeeze()
    
    # Write to bytes buffer
    buffer = io.BytesIO()
    sf.write(buffer, audio_arr, model.config.sampling_rate, format="WAV")
    buffer.seek(0)
    
    return buffer.read()


async def synthesize_speech_base64(
    text: str,
    language: str = "en"
) -> str:
    """
    Convert text to speech and return as base64-encoded WAV.
    
    Args:
        text: Text to speak
        language: Language code
        
    Returns:
        Base64-encoded WAV audio (for web playback)
    """
    audio_bytes = await synthesize_speech(text, language)
    return base64.b64encode(audio_bytes).decode("utf-8")


def is_tts_available() -> bool:
    """Check if TTS dependencies are installed."""
    try:
        from parler_tts import ParlerTTSForConditionalGeneration
        from transformers import AutoTokenizer
        return True
    except ImportError:
        return False


def get_supported_languages() -> list:
    """Get list of supported language codes."""
    return list(LANGUAGE_SPEAKER_MAP.keys())


# Export for API usage
__all__ = [
    "synthesize_speech",
    "synthesize_speech_base64",
    "load_tts_model",
    "is_tts_available",
    "is_language_supported",
    "get_supported_languages",
    "LANGUAGE_SPEAKER_MAP",
    "LANGUAGE_NAMES",
]
