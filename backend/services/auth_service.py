from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.ai_response_repository import AIResponseRepository
from repositories.api_key_repository import ApiKeyRepository
from repositories.chat_message_repository import ChatMessageRepository
from repositories.chat_session_repository import ChatSessionRepository
from schemas.login_request import LoginRequest
from util.database import connect_db
from repositories.account import AccountRepository
from models.account import Account
from schemas.sign_up_request import SignUpRequest
from util.security import PasswordEncoder, TokenProvider
from util.redis import connect_redis


class AuthService:
    def __init__(self, db: AsyncSession = Depends(connect_db)):
        self.db = db
        self.account_repository = AccountRepository(db)
        self.chat_message_repository = ChatMessageRepository(db)
        self.ai_response_repository = AIResponseRepository(db)
        self.chat_session_repository = ChatSessionRepository(db)
        self.user_api_key_repository = ApiKeyRepository(db)

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

    async def login(self, request: LoginRequest) -> tuple:
        account = await self.account_repository.find_by_login_id(
            request.login_id
        )

        if not account:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="아이디 또는 비밀번호가 올바르지 않습니다."
            )

        is_valid_password = PasswordEncoder.matches(
            request.password,
            account.password
        )

        if not is_valid_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="아이디 또는 비밀번호가 올바르지 않습니다."
            )

        access_token = TokenProvider.create_access_token(
            subject=str(account.id),
            role=account.role
        )

        refresh_token = TokenProvider.create_refresh_token(
            subject=str(account.id)
        )

        await connect_redis.set(
            f"refresh:{account.id}",
            refresh_token,
            ex=60 * 60 * 24 * 7
        )

        return access_token, account.role, account.id, refresh_token

    async def logout(self, account_id: str) -> bool:
        await connect_redis.delete(f"refresh:{account_id}")
        return True


    async def refresh(self, refresh_token: str) -> str:

        payload = TokenProvider.decode_token(refresh_token)

        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )

        account_id = payload.get("sub")

        if not isinstance(account_id, str):
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )

        saved_refresh_token = await connect_redis.get(
            f"refresh:{account_id}"
        )

        if saved_refresh_token != refresh_token:
            raise HTTPException(
                status_code=401,
                detail="Refresh token mismatch"
            )

        account = await self.account_repository.find_by_account_id(account_id)

        if not account:
            raise HTTPException(
                status_code=401,
                detail="Account not found"
            )

        new_access_token = TokenProvider.create_access_token(
            subject=str(account.id),
            role=account.role
        )

        return new_access_token


    async def delete_account(self, account_id: str) -> bool:
        account = await self.account_repository.find_by_account_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="계정을 찾을 수 없습니다."
            )
        # 메시지 전부 가져오기(채팅 내역)
        chat_data = await self.chat_session_repository.find_by_account_id(int(account_id))

        for chat in chat_data:

            messages = await self.chat_message_repository.find_by_session_id(chat.id)

            for message in messages:
                await self.ai_response_repository.delete_by_message_id(message.id)

            for message in messages:
                await self.chat_message_repository.delete(message.id)

            await self.chat_session_repository.delete(chat.id)

        await self.user_api_key_repository.delete_all_by_account_id(int(account_id))

        await connect_redis.delete(f"refresh:{account_id}")
        deleted = await self.account_repository.delete(account_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="계정 삭제에 실패했습니다."
            )
        return True