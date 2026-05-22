from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.account import Account


class AccountRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_by_login_id(self, login_id: str) -> Account | None:
        result = await self.db.execute(select(Account).filter(Account.login_id == login_id))
        return result.scalars().first()

    async def save(self, account: Account) -> Account:
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account