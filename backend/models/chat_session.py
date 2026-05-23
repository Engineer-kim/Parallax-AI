from models.base import Base
from sqlalchemy import Column, Text, VARCHAR, TIMESTAMP, ForeignKey, BigInteger
from sqlalchemy.sql import func

class ChatSession(Base):

    __tablename__ = "chat_session"

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    account_id = Column(
        BigInteger,
        ForeignKey("account.id", ondelete="CASCADE"),
        nullable=False
    )

    title = Column(Text, nullable=False)

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.now()
    )