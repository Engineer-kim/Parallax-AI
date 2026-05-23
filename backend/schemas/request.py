from pydantic import BaseModel, field_validator
from enum import Enum
from typing import Optional


class ContentType(str, Enum):
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"
    VIDEO = "video"


class ParallaxRequest(BaseModel):

    session_id: int

    input_order: int

    selected_model: str

    content_type: ContentType

    content: Optional[str] = None

    file_name: Optional[str] = None

    file_url: Optional[str] = None

    mime_type: Optional[str] = None

    file_data: Optional[bytes] = None

    has_text: bool = False

    has_file: bool = False

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v):

        if v is not None and v.strip() == "":
            raise ValueError("content는 빈 값일 수 없습니다")

        return v