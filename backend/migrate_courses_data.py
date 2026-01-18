"""
Migration script to add courses_data and data_source columns to degree_plans table.
Run with: python migrate_courses_data.py
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    """Add courses_data and data_source columns to degree_plans table."""
    
    # Parse the database URL
    if DATABASE_URL.startswith("postgresql+asyncpg://"):
        db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    else:
        db_url = DATABASE_URL
    
    conn = await asyncpg.connect(db_url)
    
    try:
        # Check if columns already exist
        columns = await conn.fetch("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'degree_plans'
        """)
        existing_columns = [col['column_name'] for col in columns]
        
        # Add courses_data column if it doesn't exist
        if 'courses_data' not in existing_columns:
            print("Adding courses_data column...")
            await conn.execute("""
                ALTER TABLE degree_plans 
                ADD COLUMN courses_data JSONB DEFAULT '[]'::jsonb
            """)
            print("✅ courses_data column added")
        else:
            print("✅ courses_data column already exists")
        
        # Add data_source column if it doesn't exist
        if 'data_source' not in existing_columns:
            print("Adding data_source column...")
            await conn.execute("""
                ALTER TABLE degree_plans 
                ADD COLUMN data_source VARCHAR(50)
            """)
            print("✅ data_source column added")
        else:
            print("✅ data_source column already exists")
        
        print("\n🎉 Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
