import os
import json
import logging
import redis.asyncio as redis
from typing import Any, Optional

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Global Redis client instance
redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Initializes the Redis connection pool."""
    global redis_client
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        # Test connection
        await redis_client.ping()
        logger.info(f"✅ Successfully connected to Redis at {REDIS_URL}")
    except Exception as e:
        logger.warning(f"⚠️ Failed to connect to Redis: {e}. Caching will be disabled.")
        redis_client = None

async def close_redis():
    """Closes the Redis connection pool."""
    global redis_client
    if redis_client:
        await redis_client.aclose()
        logger.info("Closed Redis connection.")

async def get_cache(key: str) -> Optional[Any]:
    """Retrieve a JSON parsed object from Redis."""
    if not redis_client:
        return None
    try:
        val = await redis_client.get(key)
        if val:
            return json.loads(val)
    except Exception as e:
        logger.error(f"Redis get error: {e}")
    return None

async def set_cache(key: str, value: Any, expire_seconds: int = 3600):
    """Store a JSON serializable object in Redis with an expiration."""
    if not redis_client:
        return
    try:
        val_str = json.dumps(value)
        await redis_client.set(key, val_str, ex=expire_seconds)
    except Exception as e:
        logger.error(f"Redis set error: {e}")
