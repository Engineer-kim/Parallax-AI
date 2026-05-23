from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_CONFIG
from routers import test, chat, auth

from dotenv import load_dotenv
import os

from util.auth_middleware import AuthFilterMiddleware

load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "")

app = FastAPI(title="Parallax AI")

app.add_middleware(CORSMiddleware, **CORS_CONFIG)
app.add_middleware(AuthFilterMiddleware)

app.include_router(test.router, prefix="/server")
app.include_router(chat.router, prefix="/start")
app.include_router(auth.router, prefix="/session")