"""
Script to download Indic Parler-TTS model explicitly.
Run this to ensure the model is cached before starting the server.
"""
import sys
import os

# Ensure we are running in venv
print(f"Python: {sys.executable}")

try:
    import torch
    from parler_tts import ParlerTTSForConditionalGeneration, ParlerTTSConfig
    from transformers import AutoTokenizer, AutoConfig
    from huggingface_hub import hf_hub_download
    import json

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    if device == "cpu":
        print("⚠️ Warning: CUDA not detected. Using CPU (slow).")
    else:
        print(f"✅ GPU Detected: {torch.cuda.get_device_name(0)}")

    print("Downloading/Loading Indic Parler-TTS model (approx 2.5GB)...")

    # FIX: Manually load config to handle library vs model mismatch
    repo_id = "ai4bharat/indic-parler-tts"
    
    try:
        # Try default loading first
        model = ParlerTTSForConditionalGeneration.from_pretrained(repo_id).to(device)
    except (ValueError, TypeError) as e:
        print(f"⚠️ Default loading failed ({e}). Attempting manual config fix...")
        
        # Download config.json
        config_path = hf_hub_download(repo_id=repo_id, filename="config.json")
        with open(config_path, "r") as f:
            config_dict = json.load(f)
            
        # Manually construct config if needed
        # The issue is usually missing top-level config objects expected by new library
        # We try to use AutoConfig with trust_remote_code if applicable, 
        # or just instantiate ParlerTTSConfig with the dict.
        
        # In newer parler-tts, these might be mandatory. 
        # But config.json likely has them as nested dicts or assumes defaults.
        # We will try to load it ignoring the error or patching it.
        
        config = ParlerTTSConfig(**config_dict)
        model = ParlerTTSForConditionalGeneration.from_pretrained(repo_id, config=config).to(device)

    tokenizer = AutoTokenizer.from_pretrained(repo_id)
    
    print("✅ Model successfully downloaded and cached!")

except ImportError:
    print("❌ Error: parler-tts not installed. Please run:")
    print("pip install git+https://github.com/huggingface/parler-tts.git")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"❌ Error downloading model: {e}")
