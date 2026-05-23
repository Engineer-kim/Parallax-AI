from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.chat_session import ChatSession


class ChatSessionRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        account_id: int,
        title: str
    ):

        session = ChatSession(
            account_id=account_id,
            title=title
        )

        self.db.add(session)

        await self.db.commit()
        await self.db.refresh(session)

        return session

    async def find_by_id(
        self,
        session_id: int
    ):

        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.id == session_id)
        )

        return result.scalar_one_or_none()

    async def find_by_account_id(
        self,
        account_id: int
    ):

        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.account_id == account_id)
            .order_by(ChatSession.created_at.desc())
        )

        return result.scalars().all()

    async def update_title(
        self,
        session_id: int,
        title: str
    ):

        session = await self.find_by_id(session_id)

        if not session:
            return None

        session.title = title

        await self.db.commit()
        await self.db.refresh(session)

        return session

    async def delete(
        self,
        session_id: int
    ):

        session = await self.find_by_id(session_id)

        if not session:
            return False

        await self.db.delete(session)
        await self.db.commit()

        return True