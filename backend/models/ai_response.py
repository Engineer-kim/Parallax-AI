from models.base import Base
from sqlalchemy import Column, Text, VARCHAR, TIMESTAMP, ForeignKey, BigInteger, Integer
from sqlalchemy.sql import func

class AIResponse(Base):

    __tablename__ = "ai_response"

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    message_id = Column(
        BigInteger,
        ForeignKey("chat_message.id", ondelete="CASCADE"),
        nullable=False
    )

    model = Column(VARCHAR(50), nullable=False)

    content = Column(Text, nullable=True)

    latency_ms = Column(Integer)

    error = Column(Text)

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.now()
    )