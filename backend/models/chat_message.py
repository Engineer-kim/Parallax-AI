from models.base import Base
from sqlalchemy import Column, Text, VARCHAR, TIMESTAMP, ForeignKey, BigInteger,Integer
from sqlalchemy.sql import func


class ChatMessage(Base):

    __tablename__ = "chat_message"

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    session_id = Column(
        BigInteger,
        ForeignKey("chat_session.id", ondelete="CASCADE"),
        nullable=False
    )

    role = Column(VARCHAR(50), nullable=False)

    input_order = Column(Integer, nullable=False)

    content_type = Column(VARCHAR(50), nullable=False)

    content = Column(Text)

    file_url = Column(Text)

    mime_type = Column(Text)

    selected_model = Column(VARCHAR(50))

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.now()
    )