import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException, status
from services.auth_service import AuthService
from schemas.sign_up_request import SignUpRequest
from schemas.login_request import LoginRequest
from models.account import Account
from util.security import PasswordEncoder, TokenProvider
from util.redis import connect_redis


@pytest.mark.asyncio
async def test_sign_up_success(monkeypatch):
    mock_db = AsyncMock()
    mock_repo = AsyncMock()

    request = SignUpRequest(
        login_id="test_user",
        password="password123",
        nickname="tester"
    )

    mock_repo.find_by_login_id.return_value = None

    expected_account = Account(
        login_id=request.login_id,
        password="hashed_password123",
        nickname=request.nickname,
        role="ROLE_USER"
    )
    mock_repo.save.return_value = expected_account

    monkeypatch.setattr(PasswordEncoder, "encode", lambda p: "hashed_password123")

    service = AuthService(db=mock_db)
    service.account_repository = mock_repo

    result = await service.sign_up(request)

    assert result.login_id == request.login_id
    assert result.nickname == request.nickname
    assert result.role == "ROLE_USER"
    mock_repo.find_by_login_id.assert_called_once_with(request.login_id)
    mock_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_sign_up_duplicate_login_id():
    mock_db = AsyncMock()
    mock_repo = AsyncMock()

    request = SignUpRequest(
        login_id="existing_user",
        password="password123",
        nickname="tester"
    )

    mock_repo.find_by_login_id.return_value = Account(
        login_id="existing_user",
        password="hashed",
        nickname="old",
        role="ROLE_USER"
    )

    service = AuthService(db=mock_db)
    service.account_repository = mock_repo

    with pytest.raises(HTTPException) as exc_info:
        await service.sign_up(request)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert exc_info.value.detail == "이미 사용중인 ID입니다."


@pytest.mark.asyncio
async def test_login_success(monkeypatch):
    mock_db = AsyncMock()
    mock_repo = AsyncMock()

    request = LoginRequest(login_id="test_user", password="password123")
    account = Account(
        login_id="test_user",
        password="hashed_password123",
        nickname="tester",
        role="ROLE_USER"
    )

    mock_repo.find_by_login_id.return_value = account

    monkeypatch.setattr(PasswordEncoder, "matches", lambda p, h: True)
    monkeypatch.setattr(TokenProvider, "create_access_token", lambda subject, role: "mock_access")
    monkeypatch.setattr(TokenProvider, "create_refresh_token", lambda subject: "mock_refresh")

    mock_redis_set = AsyncMock()
    monkeypatch.setattr(connect_redis, "set", mock_redis_set)

    service = AuthService(db=mock_db)
    service.account_repository = mock_repo

    result = await service.login(request)

    assert result["access_token"] == "mock_access"
    assert result["refresh_token"] == "mock_refresh"
    assert result["token_type"] == "bearer"
    mock_redis_set.assert_called_once_with("refresh:test_user", "mock_refresh", ex=604800)


@pytest.mark.asyncio
async def test_login_invalid_password(monkeypatch):
    mock_db = AsyncMock()
    mock_repo = AsyncMock()

    request = LoginRequest(login_id="test_user", password="wrong_password")
    account = Account(
        login_id="test_user",
        password="hashed_password123",
        nickname="tester",
        role="ROLE_USER"
    )

    mock_repo.find_by_login_id.return_value = account
    monkeypatch.setattr(PasswordEncoder, "matches", lambda p, h: False)

    service = AuthService(db=mock_db)
    service.account_repository = mock_repo

    with pytest.raises(HTTPException) as exc_info:
        await service.login(request)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "아이디 또는 비밀번호가 올바르지 않습니다."


@pytest.mark.asyncio
async def test_logout_success(monkeypatch):
    mock_db = AsyncMock()
    mock_redis_delete = AsyncMock()
    monkeypatch.setattr(connect_redis, "delete", mock_redis_delete)

    service = AuthService(db=mock_db)
    result = await service.logout("test_user")

    assert result is True
    mock_redis_delete.assert_called_once_with("refresh:test_user")


@pytest.mark.asyncio
async def test_refresh_success(monkeypatch):
    mock_db = AsyncMock()
    mock_repo = AsyncMock()

    refresh_token = "valid_refresh"
    payload = {"type": "refresh", "sub": "test_user"}
    account = Account(login_id="test_user", password="hashed", nickname="tester", role="ROLE_USER")

    monkeypatch.setattr(TokenProvider, "decode_token", lambda t: payload)

    mock_redis_get = AsyncMock(return_value="valid_refresh")
    monkeypatch.setattr(connect_redis, "get", mock_redis_get)

    mock_repo.find_by_login_id.return_value = account
    monkeypatch.setattr(TokenProvider, "create_access_token", lambda subject, role: "new_access")

    service = AuthService(db=mock_db)
    service.account_repository = mock_repo

    result = await service.refresh(refresh_token)

    assert result == "new_access"
    mock_redis_get.assert_called_once_with("refresh:test_user")
    mock_repo.find_by_login_id.assert_called_once_with("test_user")


@pytest.mark.asyncio
async def test_refresh_token_mismatch(monkeypatch):
    mock_db = AsyncMock()

    refresh_token = "wrong_refresh"
    payload = {"type": "refresh", "sub": "test_user"}

    monkeypatch.setattr(TokenProvider, "decode_token", lambda t: payload)

    mock_redis_get = AsyncMock(return_value="different_refresh")
    monkeypatch.setattr(connect_redis, "get", mock_redis_get)

    service = AuthService(db=mock_db)

    with pytest.raises(HTTPException) as exc_info:
        await service.refresh(refresh_token)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Refresh token mismatch"