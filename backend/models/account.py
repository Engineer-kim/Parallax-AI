from sqlalchemy import Column, BigInteger, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

from enums.auth_enum import Auth
from util.util import KST

Base = declarative_base()


class Account(Base):
    __tablename__ = "account"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    login_id = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    nickname = Column(String(100), nullable=False)
    role = Column(SQLEnum(Auth), nullable=False, default=Auth.ROLE_USER)
    created_at = Column(DateTime, nullable=False, default=datetime.now(KST))

    def __repr__(self):
        return f"<Account(id={self.id}, login_id={self.login_id}, nickname={self.nickname})>"