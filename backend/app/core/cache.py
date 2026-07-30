import os
import json
import time

UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL", "")
UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")

# In-memory Redis Cache fallback
LOCAL_MEMORY_CACHE = {}

def get_cache_key(query: str, limit: int = 10) -> str:
    clean_q = (query or "").strip().lower()
    return f"lfe:cache:query:{clean_q}:{limit}"

def get_cached_search(query: str, limit: int = 10):
    key = get_cache_key(query, limit)

    # 1. Try Upstash Redis REST API if configured
    if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN:
        try:
            import requests
            headers = {"Authorization": f"Bearer {UPSTASH_REDIS_REST_TOKEN}"}
            res = requests.get(f"{UPSTASH_REDIS_REST_URL}/get/{key}", headers=headers, timeout=3)
            if res.status_code == 200:
                val = res.json().get("result")
                if val:
                    print(f"[Redis Cache] Hit for query: '{query}'")
                    return json.loads(val)
        except Exception as e:
            print(f"[Redis Cache] Error fetching from Upstash: {e}")

    # 2. In-memory Cache Fallback with 24-hour TTL (86400 seconds)
    if key in LOCAL_MEMORY_CACHE:
        entry = LOCAL_MEMORY_CACHE[key]
        if time.time() - entry["timestamp"] < 86400:
            print(f"[In-Memory Cache] Hit for query: '{query}'")
            return entry["data"]

    return None

def set_cached_search(query: str, limit: int, data: list, ttl_seconds: int = 86400):
    if not data:
        return

    key = get_cache_key(query, limit)
    json_str = json.dumps(data)

    # 1. Save to Upstash Redis if configured
    if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN:
        try:
            import requests
            headers = {"Authorization": f"Bearer {UPSTASH_REDIS_REST_TOKEN}"}
            requests.post(f"{UPSTASH_REDIS_REST_URL}/set/{key}?EX={ttl_seconds}", data=json_str, headers=headers, timeout=3)
            print(f"[Redis Cache] Saved query '{query}' to Upstash Redis.")
        except Exception as e:
            print(f"[Redis Cache] Error saving to Upstash: {e}")

    # 2. Save to In-memory Cache
    LOCAL_MEMORY_CACHE[key] = {
        "timestamp": time.time(),
        "data": data
    }
