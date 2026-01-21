"""
TTS Service for AI Interview Simulator.
Uses Indic Parler-TTS for high-quality voice synthesis in multiple Indian languages.

Model: ai4bharat/indic-parler-tts (from HuggingFace)
Supports: Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, English, and more.
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
        from parler_tts import ParlerTTSForConditionalGeneration
        from transformers import AutoTokenizer
        
        print("[TTS] Loading Indic Parler-TTS model...")
        device = get_device()
        
        # Load model (downloads ~2.5GB on first run)
        _model = ParlerTTSForConditionalGeneration.from_pretrained(
            "ai4bharat/indic-parler-tts"
        ).to(device)
        
        # Load tokenizers
        _tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indic-parler-tts")
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


# Voice description presets
VOICE_PRESETS = {
    "female_professional": "A female speaker with a clear Indian accent delivers professional speech with moderate speed and natural intonation. The recording is of high quality with the speaker's voice sounding clear.",
    "male_professional": "A male speaker with a deep voice and clear Indian accent delivers professional speech at a moderate pace. The recording is clear and close-up.",
    "female_friendly": "A female speaker with a warm, friendly Indian accent speaks at a comfortable pace with slight expressiveness. High quality recording.",
    "male_calm": "A male speaker with a calm, reassuring Indian accent delivers speech slowly and clearly. Studio quality recording.",
    "interviewer": "A professional female interviewer with a clear, confident Indian accent speaks at a moderate pace with natural intonation. Studio quality recording.",
}


async def synthesize_speech(
    text: str,
    language: str = "en",
    voice_preset: str = "interviewer"
) -> bytes:
    """
    Convert text to speech using Indic Parler-TTS.
    
    Args:
        text: Text to speak
        language: Language code (en, hi, ta, te, bn, etc.)
        voice_preset: Voice description preset
        
    Returns:
        WAV audio bytes
    """
    model, tokenizer, description_tokenizer = load_tts_model()
    device = get_device()
    
    # Get voice description
    description = VOICE_PRESETS.get(voice_preset, VOICE_PRESETS["interviewer"])
    
    # Add language context to description if not English
    if language != "en":
        lang_names = {
            "hi": "Hindi",
            "ta": "Tamil",
            "te": "Telugu",
            "bn": "Bengali",
            "mr": "Marathi",
            "kn": "Kannada",
            "ml": "Malayalam",
            "gu": "Gujarati",
            "pa": "Punjabi",
            "or": "Odia",
        }
        lang_name = lang_names.get(language, "Hindi")
        description = description.replace("Indian accent", f"{lang_name} accent")
    
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
    language: str = "en",
    voice_preset: str = "interviewer"
) -> str:
    """
    Convert text to speech and return as base64-encoded WAV.
    
    Args:
        text: Text to speak
        language: Language code
        voice_preset: Voice description preset
        
    Returns:
        Base64-encoded WAV audio (for web playback)
    """
    audio_bytes = await synthesize_speech(text, language, voice_preset)
    return base64.b64encode(audio_bytes).decode("utf-8")


def is_tts_available() -> bool:
    """Check if TTS dependencies are installed."""
    try:
        from parler_tts import ParlerTTSForConditionalGeneration
        from transformers import AutoTokenizer
        return True
    except ImportError:
        return False


# Export for API usage
__all__ = [
    "synthesize_speech",
    "synthesize_speech_base64",
    "load_tts_model",
    "is_tts_available",
    "VOICE_PRESETS",
]
