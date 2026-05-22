from datetime import datetime, timedelta

import jwt
from bcrypt import hashpw, gensalt, checkpw
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseMod
from util.util import KST
from fastapi import Depends, HTTPException, status

from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
expire_minutes_raw = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
ACCESS_TOKEN_EXPIRE_MINUTES = int(expire_minutes_raw) if expire_minutes_raw else 30


class PasswordEncoder:
    @staticmethod
    def encode(password: str) -> str:
        return hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    @staticmethod
    def matches(raw_password: str, encoded_password: str) -> bool:
        return checkpw(raw_password.encode('utf-8'), encoded_password.encode('utf-8'))

class TokenProvider:
    @staticmethod
    def create_access_token(subject: str, role: str) -> str:
        expire = datetime.now(KST) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {"sub": subject, "role": role, "exp": expire}
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict | None:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except (jwt.PyJWTError, AttributeError):
            return None

oauth2_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> dict:
    token = credentials.credentials
    payload = TokenProvider.decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied"
            )
        return current_user