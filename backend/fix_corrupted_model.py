"""
Script to clean corrupted HuggingFace cache for Indic Parler-TTS and retry download.
Run this if you get 'SafetensorError' or 'invalid JSON' errors.
"""
import shutil
import os
import sys
from pathlib import Path

# Common cache locations on Windows
CACHE_DIR = Path(os.path.expanduser("~/.cache/huggingface/hub/models--ai4bharat--indic-parler-tts"))

def clean_cache():
    print(f"Checking for corrupted cache at: {CACHE_DIR}")
    
    if CACHE_DIR.exists():
        print("Found existing cache. Deleting to force fresh download...")
        try:
            shutil.rmtree(CACHE_DIR)
            print("✅ Cache cleared successfully.")
        except Exception as e:
            print(f"❌ Error clearing cache: {e}")
            print("Please manually delete the folder:", CACHE_DIR)
            return False
    else:
        print("No cache found. Ready for fresh download.")
        
    return True

if __name__ == "__main__":
    if clean_cache():
        print("\n🚀 restarting download process...")
        # Import the download logic from download_model.py
        # We run it as a subprocess to ensure clean state
        import subprocess
        
        # Use the same python executable
        subprocess.run([sys.executable, "download_model.py"])
