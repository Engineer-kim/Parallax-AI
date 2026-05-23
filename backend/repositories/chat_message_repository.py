from sqlalchemy.orm import Session
from models.chat_message import ChatMessage


class ChatMessageRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        session_id: int,
        role: str,
        input_order: int,
        selected_model: str,
        content_type: str,
        content: str = None,
        file_url: str = None,
        mime_type: str = None
    ):

        message = ChatMessage(
            session_id=session_id,
            role=role,
            input_order=input_order,
            selected_model=selected_model,
            content_type=content_type,
            content=content,
            file_url=file_url,
            mime_type=mime_type
        )

        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return message

    def find_by_id(self, message_id: int):

        return (
            self.db.query(ChatMessage)
            .filter(ChatMessage.id == message_id)
            .first()
        )

    def find_by_session_id(self, session_id: int):

        return (
            self.db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.input_order.asc())
            .all()
        )

    def update_selected_model(
        self,
        message_id: int,
        selected_model: str
    ):

        message = (
            self.db.query(ChatMessage)
            .filter(ChatMessage.id == message_id)
            .first()
        )

        if not message:
            return None

        message.selected_model = selected_model

        self.db.commit()
        self.db.refresh(message)

        return message

    def delete(self, message_id: int):

        message = (
            self.db.query(ChatMessage)
            .filter(ChatMessage.id == message_id)
            .first()
        )

        if not message:
            return False

        self.db.delete(message)
        self.db.commit()

        return True