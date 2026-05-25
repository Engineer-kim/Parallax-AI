import os
from cryptography.fernet import Fernet

SECRET_KEY = os.getenv("ENCRYPT_SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("ENCRYPT_SECRET_KEY가 설정되지 않았습니다.")

fernet = Fernet(SECRET_KEY.encode())


def encrypt(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    return fernet.decrypt(value.encode()).decode()