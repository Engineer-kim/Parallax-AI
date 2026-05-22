from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# 공통 DB 연결 함수 및 계층별 컴포넌트 임포트
from config.database import connect_db
from repositories.account import AccountRepository
from models.account import Account
from schemas.sign_up_request import SignUpRequest
from util.security import PasswordEncoder

class AuthService:
    def __init__(self, db: AsyncSession = Depends(connect_db)):
        self.db = db
        self.account_repository = AccountRepository(db)

    async def sign_up(self, request: SignUpRequest) -> Account:
        existing_account = await self.account_repository.find_by_login_id(request.login_id)
        if existing_account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용중인 ID입니다."
            )

        hashed_password = PasswordEncoder.encode(request.password)
        new_account = Account(
            login_id=request.login_id,
            password=hashed_password,
            nickname=request.nickname,
            role="ROLE_USER"
        )

        saved_account = await self.account_repository.save(new_account)
        return saved_account