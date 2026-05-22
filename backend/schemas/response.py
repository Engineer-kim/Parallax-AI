from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    BLOCKED = "blocked"


class ModelResult(BaseModel):
    model: str
    result: Optional[str] = None
    error: Optional[str] = None
    latency_ms: Optional[float] = None


class ParallaxResponse(BaseModel):
    status: ResponseStatus
    request_id: str
    results: list[ModelResult] = []
    message: Optional[str] = None