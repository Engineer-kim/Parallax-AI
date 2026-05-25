from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from util.database import connect_db

from repositories.api_key_repository import ApiKeyRepository


class ApiKeyService:

    def __init__(self, db: AsyncSession = Depends(connect_db)):
        self.db = db
        self.api_key_repository = ApiKeyRepository(db)

    async def upsert_api_key(
        self,
        account_id: int,
        model: str,
        api_key: str
    ):
        return await self.api_key_repository.upsert(
            account_id=account_id,
            model=model,
            api_key=api_key
        )

    async def delete_api_key(
        self,
        account_id: int,
        model: str
    ):
        return await self.api_key_repository.delete(
            account_id=account_id,
            model=model
        )

    async def get_registered_models(
        self,
        account_id: int
    ):
        return await self.api_key_repository.find_registered_models(account_id)

    async def find_by_account_id(
        self,
        account_id: int
    ):
        return await self.api_key_repository.find_by_account_id(account_id)