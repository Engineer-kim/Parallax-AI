import os
from dotenv import load_dotenv

load_dotenv()

IS_PROD = os.getenv("ENV") == "production"

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

CORS_CONFIG = {
    "allow_origins": ALLOWED_ORIGINS,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

ALLOWED_EXTENSIONS = {
    "text": ["txt", "md"],
    "file": ["pdf", "docx", "xlsx", "csv", "txt", "md"],
    "image": ["jpg", "jpeg", "png", "webp", "gif"],
    "video": ["mp4", "mov", "avi", "mkv"],
}
