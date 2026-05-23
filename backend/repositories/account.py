from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.account import Account


class AccountRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Account 테이블의 PK 값으로 토큰 및 리프레쉬 토큰 생성도 이걸로함
    async def find_by_account_id(self, account_id: str) -> Account | None:
        result = await self.db.execute(select(Account).filter(Account.id == account_id))
        return result.scalars().first()

    # 진짜 로그인및 회원가입때 사용할 로그인 하이디
    async def find_by_login_id(self, login_id: str) -> Account | None:
        result = await self.db.execute(select(Account).filter(Account.login_id == login_id))
        return result.scalars().first()



    async def save(self, account: Account) -> Account:
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account