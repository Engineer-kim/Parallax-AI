from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.chat_message import ChatMessage


class ChatMessageRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        session_id: int,
        role: str,
        input_order: int,
        selected_model: str | None,
        content_type: str,
        content: str | None = None,
        file_url: str | None = None,
        mime_type: str | None = None
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

        await self.db.commit()

        await self.db.refresh(message)

        return message

    async def find_by_id(
        self,
        message_id: int
    ):

        result = await self.db.execute(
            select(ChatMessage).where(
                ChatMessage.id == message_id
            )
        )

        return result.scalars().first()

    async def find_by_session_id(
        self,
        session_id: int
    ):

        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.input_order.asc())
        )

        return result.scalars().all()

    async def update_selected_model(
        self,
        message_id: int,
        selected_model: str
    ):

        message = await self.find_by_id(message_id)

        if not message:
            return None

        message.selected_model = selected_model

        await self.db.commit()

        await self.db.refresh(message)

        return message

    async def delete(
        self,
        message_id: int
    ):

        message = await self.find_by_id(message_id)

        if not message:
            return False

        await self.db.delete(message)

        await self.db.commit()

        return True