import httpx
import asyncio

async def test():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("http://localhost:11434/api/tags")
            print(f"Status: {resp.status_code}")
            print(f"Models: {[m['name'] for m in resp.json().get('models', [])]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
