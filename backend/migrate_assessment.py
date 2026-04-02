import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        print("Migrating Database for Assessment Platform...")
        
        # 1. Drop old mismatched test_results table if it exists
        try:
            print("Dropping old test_results table due to UUID mismatch...")
            await conn.execute(text("DROP TABLE IF EXISTS test_results CASCADE"))
        except Exception as e:
            print(f"Failed to drop old test_results (might not exist): {e}")

        # 2. Uploaded documents table will be created automatically via create_all on startup
        # Test results will also be recreated via create_all on startup with correct schema.
        
        print("Migration preparation complete. Tables will be created by main app startup.")

if __name__ == "__main__":
    asyncio.run(migrate())
