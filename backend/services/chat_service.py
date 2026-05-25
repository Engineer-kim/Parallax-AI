import asyncio
import time

from models.user_api_key import UserApiKey
from repositories.ai_response_repository import AIResponseRepository
from repositories.chat_message_repository import ChatMessageRepository
from repositories.chat_session_repository import ChatSessionRepository
from repositories.user_api_key_repository import UserApiKeyRepository
from schemas.response import ModelResult
from services.llm_service import call_claude
from services.llm_service import call_gemini
from services.llm_service import call_gpt
from fastapi import HTTPException, status


class ChatService:

    def __init__(self, db):

        self.chat_message_repository = ChatMessageRepository(db)
        self.ai_response_repository = AIResponseRepository(db)
        self.chat_session_repository = ChatSessionRepository(db)
        self.user_api_key_repository = UserApiKeyRepository(db)

    async def save_user_message(
        self,
        account_id: int,
        session_id: int,
        role: str,
        input_order: int,
        selected_model: str | None = None,
        content_type: str = "text",
        content: str | None = None,
        file_url: str | None = None,
        mime_type: str | None = None
    ):

        if not session_id or session_id == 0 or session_id is None:
            session = await self.chat_session_repository.create(
                account_id=account_id,
                title="새 채팅"
            )

            session_id = session.id

            title = (
                content
                .replace("\n", " ")
                .strip()[:30]
            )

            await self.chat_session_repository.update_title(
                session_id=session_id,
                title=title
            )

        return await self.chat_message_repository.create(
            session_id=session_id,
            role=role,
            input_order=input_order,
            selected_model=selected_model,
            content_type=content_type,
            content=content,
            file_url=file_url,
            mime_type=mime_type
        )

    async def process_ai_response(
        self,
        message_id: int,
        prompt: str,
        account_id: int,
    ) -> list[ModelResult]:

        user_keys = self.user_api_key_repository.find_by_account_id(account_id)

        if not user_keys:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="등록된 API 키가 아무것도 없습니다."
            )

        async def execute_model(
            model_name: str,
            func,
            api_key: str
        ) -> ModelResult:

            started = time.perf_counter()

            try:

                result = await func(prompt, api_key)

                latency = int(
                    (time.perf_counter() - started) * 1000
                )

                await self.ai_response_repository.create(
                    message_id=message_id,
                    model=model_name,
                    content=result,
                    latency_ms=latency,
                    error=None
                )

                return ModelResult(
                    model=model_name,
                    result=result,
                    error=None,
                    latency_ms=latency
                )

            except Exception as e:

                latency = int(
                    (time.perf_counter() - started) * 1000
                )

                await self.ai_response_repository.create(
                    message_id=message_id,
                    model=model_name,
                    content=None,
                    latency_ms=latency,
                    error=str(e)
                )

                return ModelResult(
                    model=model_name,
                    result=None,
                    error=str(e),
                    latency_ms=latency
                )

        tasks = []
        if "gpt" in user_keys:
            tasks.append(execute_model("gpt", call_gpt, user_keys["gpt"]))
        if "gemini" in user_keys:
            tasks.append(execute_model("gemini", call_gemini, user_keys["gemini"]))
        if "claude" in user_keys:
            tasks.append(execute_model("claude", call_claude, user_keys["claude"]))

        results = await asyncio.gather(*tasks, return_exceptions=False)

        return list(results)

    async def select_model(
        self,
        message_id: int,
        selected_model: str
    ):

        return await self.chat_message_repository.update_selected_model(
            message_id=message_id,
            selected_model=selected_model
        )

    async def get_chat_history(
        self,
        session_id: int
    ):

        messages = await self.chat_message_repository.find_by_session_id(
            session_id=session_id
        )

        result = []

        for message in messages:

            responses = await self.ai_response_repository.find_by_message_id(
                message.id
            )

            result.append({
                "message_id": message.id,
                "role": message.role,
                "input_order": message.input_order,
                "selected_model": message.selected_model,
                "content_type": message.content_type,
                "content": message.content,
                "file_url": message.file_url,
                "mime_type": message.mime_type,
                "responses": [
                    {
                        "model": response.model,
                        "content": response.content,
                        "error": response.error,
                        "latency_ms": response.latency_ms
                    }
                    for response in responses
                ]
            })

        return result