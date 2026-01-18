"""
Migration script to add user_id column to degree_plans table.
Run this once to fix the schema mismatch.
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/degree_planner")

# Convert to asyncpg format (remove +asyncpg suffix if present)
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

async def migrate():
    print(f"Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Check if column exists
        result = await conn.fetchval("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'degree_plans' AND column_name = 'user_id'
            );
        """)
        
        if result:
            print("✅ Column 'user_id' already exists in degree_plans table.")
        else:
            print("Adding 'user_id' column to degree_plans table...")
            await conn.execute("""
                ALTER TABLE degree_plans 
                ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
            """)
            print("✅ Successfully added 'user_id' column!")
        
        # Create index for performance
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_degree_plans_user_id ON degree_plans(user_id);
        """)
        print("✅ Index created/verified.")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(migrate())
