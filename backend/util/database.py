import os
import asyncio
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from models import Base, Account, ChatSession, ChatMessage, AIResponse

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800
)

async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

def startup_trigger():
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(create_tables())
    except RuntimeError:
        try:
            asyncio.run(create_tables())
        except Exception:
            pass

startup_trigger()

async def connect_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()