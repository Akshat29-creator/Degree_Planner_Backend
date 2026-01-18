"""
Migration script to add degree_program and career_goal columns to degree_plans table.
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/degree_planner")
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

async def migrate():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Add degree_program column
        await conn.execute("""
            ALTER TABLE degree_plans 
            ADD COLUMN IF NOT EXISTS degree_program VARCHAR(200);
        """)
        print("✅ Added 'degree_program' column")
        
        # Add career_goal column
        await conn.execute("""
            ALTER TABLE degree_plans 
            ADD COLUMN IF NOT EXISTS career_goal VARCHAR(200);
        """)
        print("✅ Added 'career_goal' column")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(migrate())
