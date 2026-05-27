import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from services.auth_service import AuthService


@pytest.fixture
def mock_db():
    return MagicMock()


@pytest.fixture
def auth_service(mock_db):
    service = AuthService.__new__(AuthService)
    service.db = mock_db
    service.account_repository = MagicMock()
    service.chat_session_repository = MagicMock()
    service.chat_message_repository = MagicMock()
    service.ai_response_repository = MagicMock()
    service.user_api_key_repository = MagicMock()
    return service


@pytest.mark.asyncio
async def test_delete_account_success(auth_service):
    account_id = "1"

    mock_account = MagicMock(id=1)
    mock_session = MagicMock(id=10)
    mock_message = MagicMock(id=100)

    auth_service.account_repository.find_by_account_id = AsyncMock(return_value=mock_account)
    auth_service.chat_session_repository.find_by_account_id = AsyncMock(return_value=[mock_session])
    auth_service.chat_message_repository.find_by_session_id = AsyncMock(return_value=[mock_message])
    auth_service.ai_response_repository.delete_by_message_id = AsyncMock(return_value=True)
    auth_service.chat_message_repository.delete = AsyncMock(return_value=True)
    auth_service.chat_session_repository.delete = AsyncMock(return_value=True)
    auth_service.user_api_key_repository.delete_all_by_account_id = AsyncMock(return_value=True)
    auth_service.account_repository.delete = AsyncMock(return_value=True)

    with patch("services.auth_service.connect_redis") as mock_redis:
        mock_redis.delete = AsyncMock()
        result = await auth_service.delete_account(account_id)

    assert result is True
    auth_service.account_repository.find_by_account_id.assert_called_once_with(account_id)
    auth_service.ai_response_repository.delete_by_message_id.assert_called_once_with(mock_message.id)
    auth_service.chat_message_repository.delete.assert_called_once_with(mock_message.id)
    auth_service.chat_session_repository.delete.assert_called_once_with(mock_session.id)
    auth_service.user_api_key_repository.delete_all_by_account_id.assert_called_once_with(1)
    auth_service.account_repository.delete.assert_called_once_with(account_id)


@pytest.mark.asyncio
async def test_delete_account_not_found(auth_service):
    auth_service.account_repository.find_by_account_id = AsyncMock(return_value=None)

    with pytest.raises(HTTPException) as exc:
        await auth_service.delete_account("999")

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_delete_account_delete_failed(auth_service):
    mock_account = MagicMock(id=1)

    auth_service.account_repository.find_by_account_id = AsyncMock(return_value=mock_account)
    auth_service.chat_session_repository.find_by_account_id = AsyncMock(return_value=[])
    auth_service.user_api_key_repository.delete_all_by_account_id = AsyncMock(return_value=True)
    auth_service.account_repository.delete = AsyncMock(return_value=False)

    with patch("services.auth_service.connect_redis") as mock_redis:
        mock_redis.delete = AsyncMock()
        with pytest.raises(HTTPException) as exc:
            await auth_service.delete_account("1")

    assert exc.value.status_code == 500


@pytest.mark.asyncio
async def test_delete_account_no_sessions(auth_service):
    mock_account = MagicMock(id=1)

    auth_service.account_repository.find_by_account_id = AsyncMock(return_value=mock_account)
    auth_service.chat_session_repository.find_by_account_id = AsyncMock(return_value=[])
    auth_service.user_api_key_repository.delete_all_by_account_id = AsyncMock(return_value=True)
    auth_service.account_repository.delete = AsyncMock(return_value=True)

    with patch("services.auth_service.connect_redis") as mock_redis:
        mock_redis.delete = AsyncMock()
        result = await auth_service.delete_account("1")

    assert result is True
    auth_service.chat_message_repository.find_by_session_id.assert_not_called()