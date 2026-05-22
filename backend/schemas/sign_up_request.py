from pydantic import BaseModel, Field
from typing import Optional

class SignUpRequest(BaseModel):
    login_id: str = Field(min_length=5, max_length=20)
    password: str = Field(min_length=8, max_length=16)
    nickname: str = Field(min_length=3, max_length=15)
    role: Optional[str] = Field(default="ROLE_USER")

    class Config:
        str_strip_whitespace = True