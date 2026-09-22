"""Database configuration with SQLAlchemy async support."""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import get_settings

settings = get_settings()

# Convert postgresql:// to postgresql+asyncpg:// for async support
database_url = settings.database_url.replace(
    "postgresql://", "postgresql+asyncpg://"
)

engine = create_async_engine(
    database_url,
    echo=settings.debug,
    poolclass=NullPool,  # Recommended for async
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


async def get_db() -> AsyncSession:
    """Dependency to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables with fail-safe local SQLite fallback."""
    global engine, AsyncSessionLocal
    from sqlalchemy import text
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
            # Safe migration for adding SM-2 columns to test_results table (PostgreSQL syntax)
            for col, col_type, col_default in [
                ("ease_factor", "DOUBLE PRECISION", "2.5"),
                ("interval", "INTEGER", "1"),
                ("repetitions", "INTEGER", "0"),
                ("next_review_at", "TIMESTAMP WITH TIME ZONE", "NULL")
            ]:
                try:
                    await conn.execute(text(f"ALTER TABLE test_results ADD COLUMN {col} {col_type} DEFAULT {col_default}"))
                    print(f"Added column '{col}' to PostgreSQL 'test_results' table")
                except Exception:
                    pass
            
            # Safe migration for adding completed_course_grades to degree_plans table (PostgreSQL syntax)
            try:
                await conn.execute(text("ALTER TABLE degree_plans ADD COLUMN completed_course_grades JSONB DEFAULT '{}'"))
                print("Added column 'completed_course_grades' to PostgreSQL 'degree_plans' table")
            except Exception:
                pass
            print("Database initialized successfully via PostgreSQL.")
    except Exception as postgres_err:
        print(f"PostgreSQL connection failed ({postgres_err}). Falling back to local SQLite...")
        # Fallback to local SQLite database
        fallback_url = "sqlite+aiosqlite:///degree_planner.db"
        engine = create_async_engine(
            fallback_url,
            echo=settings.debug,
            poolclass=NullPool,
        )
        AsyncSessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        # Try initializing SQLite
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # Safe migration for adding SM-2 columns to test_results table (SQLite syntax)
            for col, col_type, col_default in [
                ("ease_factor", "FLOAT", "2.5"),
                ("interval", "INTEGER", "1"),
                ("repetitions", "INTEGER", "0"),
                ("next_review_at", "DATETIME", "NULL")
            ]:
                try:
                    await conn.execute(text(f"ALTER TABLE test_results ADD COLUMN {col} {col_type} DEFAULT {col_default}"))
                    print(f"Added column '{col}' to SQLite 'test_results' table")
                except Exception:
                    pass
            
            # Safe migration for adding completed_course_grades to degree_plans table (SQLite syntax)
            try:
                await conn.execute(text("ALTER TABLE degree_plans ADD COLUMN completed_course_grades TEXT DEFAULT '{}'"))
                print("Added column 'completed_course_grades' to SQLite 'degree_plans' table")
            except Exception:
                pass
            print("Database initialized successfully via SQLite fallback.")
