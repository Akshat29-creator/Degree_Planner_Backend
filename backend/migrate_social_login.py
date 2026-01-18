"""One-time migration script to add social login fields."""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run_migration():
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/degree_planner")
    
    # Convert to asyncpg format
    conn = await asyncpg.connect(database_url)
    
    try:
        # Add provider column
        await conn.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local';
        """)
        print("✓ Added 'provider' column")
        
        # Add provider_id column
        await conn.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
        """)
        print("✓ Added 'provider_id' column")
        
        # Make hashed_password nullable
        await conn.execute("""
            ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;
        """)
        print("✓ Made 'hashed_password' nullable")
        
        print("\n✅ Migration complete!")
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
