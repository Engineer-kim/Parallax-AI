from enum import Enum

class Auth(str, Enum):
    ROLE_ADMIN = "ROLE_ADMIN"
    ROLE_USER = "ROLE_USER"