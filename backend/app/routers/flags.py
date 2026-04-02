"""Feature Flags API Router."""
import json
import os
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict

router = APIRouter(prefix="/flags", tags=["Developer Tools"])

FLAGS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "feature_flags.json")


def _read_flags() -> Dict[str, bool]:
    """Read feature flags from the JSON file."""
    try:
        with open(FLAGS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except Exception as e:
        print(f"Error reading flags: {e}")
        return {}


def _write_flags(flags: Dict[str, bool]) -> None:
    """Write feature flags to the JSON file."""
    with open(FLAGS_FILE, "w") as f:
        json.dump(flags, f, indent=2)


def is_feature_enabled(feature_key: str) -> bool:
    """Check if a specific feature is enabled."""
    flags = _read_flags()
    return flags.get(feature_key, True)  # Default to True (enabled) if not found


def feature_guard(feature_key: str):
    """FastAPI dependency to gate routes based on a feature flag."""
    def dependency():
        if not is_feature_enabled(feature_key):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Feature '{feature_key}' is currently disabled by administrator."
            )
        return True
    return dependency


@router.get("")
async def get_flags():
    """Get all feature flags."""
    return _read_flags()


@router.put("")
async def update_flags(flags: Dict[str, bool]):
    """Update feature flags."""
    try:
        _write_flags(flags)
        return {"status": "ok", "flags": flags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{flag_key}")
async def toggle_flag(flag_key: str, enabled: bool):
    """Toggle a single feature flag."""
    flags = _read_flags()
    flags[flag_key] = enabled
    _write_flags(flags)
    return {"flag": flag_key, "enabled": enabled}
