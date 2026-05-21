from pydantic import BaseModel, field_validator
from enum import Enum
from typing import Optional


class InputType(str, Enum):
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"
    VIDEO = "video"


class ParallaxRequest(BaseModel):
    input_type: InputType
    content: Optional[str] = None
    file_name: Optional[str] = None
    file_data: Optional[bytes] = None

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v):
        if v is not None and v.strip() == "":
            raise ValueError("content는 빈 값일 수 없습니다")
        return v