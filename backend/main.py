from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_CONFIG
from routers import test, chat, auth, api_key

from dotenv import load_dotenv
import os

from util.auth_middleware import AuthFilterMiddleware
from util.database import create_tables

load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield

app = FastAPI(
    title="Parallax AI",
    lifespan=lifespan
)

app.add_middleware(CORSMiddleware, **CORS_CONFIG)
app.add_middleware(AuthFilterMiddleware)

app.include_router(test.router, prefix="/server")
app.include_router(chat.router, prefix="/start")
app.include_router(auth.router, prefix="/session")

app.include_router(api_key.router, prefix="/keys")