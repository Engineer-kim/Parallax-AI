from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.ai_response import AIResponse


class AIResponseRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        message_id: int,
        model: str,
        content: str | None,
        latency_ms: int | None = None,
        error: str | None = None
    ):

        response = AIResponse(
            message_id=message_id,
            model=model,
            content=content,
            latency_ms=latency_ms,
            error=error
        )

        self.db.add(response)

        await self.db.commit()

        await self.db.refresh(response)

        return response

    async def find_by_message_id(
        self,
        message_id: int
    ):

        result = await self.db.execute(
            select(AIResponse).where(
                AIResponse.message_id == message_id
            )
        )

        return result.scalars().all()

    async def delete_by_message_id(
        self,
        message_id: int
    ):

        responses = await self.find_by_message_id(
            message_id
        )

        for response in responses:

            await self.db.delete(response)

        await self.db.commit()

        return True