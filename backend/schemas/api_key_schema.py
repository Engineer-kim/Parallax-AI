from pydantic import BaseModel
from enum import Enum


class ModelType(str, Enum):
    GPT = "gpt"
    GEMINI = "gemini"
    CLAUDE = "claude"


class ApiKeyRequest(BaseModel):
    model: ModelType
    api_key: str


class ApiKeyResponse(BaseModel):
    model: str
    registered: bool