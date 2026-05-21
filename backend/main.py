from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_CONFIG
from routers import test

app = FastAPI(title="Parallax AI")
app.add_middleware(CORSMiddleware, **CORS_CONFIG)

app.include_router(test.router, prefix="/server")