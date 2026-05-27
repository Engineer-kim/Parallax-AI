from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user_api_key import UserApiKey
from util.crypto import encrypt, decrypt


class ApiKeyRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_by_account_id(self, account_id: int) -> dict:
        rows = (
            (
                await self.db.execute(
                    select(UserApiKey)
                    .filter(UserApiKey.account_id == account_id)
                )
            )
            .scalars()
            .all()
        )
        return {row.model: decrypt(row.api_key) for row in rows}

    async def upsert(self, account_id: int, model: str, api_key: str) -> UserApiKey:
        row = (
            (
                await self.db.execute(
                    select(UserApiKey)
                    .filter(
                        UserApiKey.account_id == account_id,
                        UserApiKey.model == model
                    )
                )
            )
            .scalars()
            .first()
        )
        if row:
            row.api_key = encrypt(api_key)
        else:
            row = UserApiKey(
                account_id=account_id,
                model=model,
                api_key=encrypt(api_key)
            )
            self.db.add(row)

        await self.db.commit()
        await self.db.refresh(row)
        return row

    async def delete(self, account_id: int, model: str) -> bool:
        row = (
            (
                await self.db.execute(
                    select(UserApiKey)
                    .filter(
                        UserApiKey.account_id == account_id,
                        UserApiKey.model == model
                    )
                )
            )
            .scalars()
            .first()
        )
        if not row:
            return False
        await self.db.delete(row)
        await self.db.commit()
        return True

    async def find_registered_models(self, account_id: int) -> list[str]:
        rows = (
            (
                await self.db.execute(
                    select(UserApiKey.model)
                    .filter(UserApiKey.account_id == account_id)
                )
            )
            .all()
        )
        return [row[0] for row in rows]


    #회원 탈퇴시 사용될 등록된 키 전부 삭제
    async def delete_all_by_account_id(self, account_id: int) -> bool:
        rows = (
            (
                await self.db.execute(
                    select(UserApiKey).filter(UserApiKey.account_id == account_id)
                )
            )
            .scalars()
            .all()
        )
        for row in rows:
            await self.db.delete(row)
        await self.db.commit()
        return True