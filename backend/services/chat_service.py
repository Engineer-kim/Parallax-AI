import asyncio
import time

from models.user_api_key import UserApiKey
from repositories.ai_response_repository import AIResponseRepository
from repositories.chat_message_repository import ChatMessageRepository
from repositories.chat_session_repository import ChatSessionRepository
from repositories.api_key_repository import ApiKeyRepository
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
        self.user_api_key_repository = ApiKeyRepository(db)

    async def save_user_message(
        self,
        account_id: int,
        session_id: int | None,
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

        user_keys = await self.user_api_key_repository.find_by_account_id(account_id)

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

                error_msg = parse_error_msg(model_name, str(e))
                return ModelResult(
                    model=model_name,
                    result=None,
                    error=error_msg,
                    latency_ms=latency
                )

        tasks = []
        if "gpt" in user_keys:
            tasks.append(execute_model("gpt", call_gpt, user_keys["gpt"]))
        if "gemini" in user_keys:
            tasks.append(execute_model("gemini", call_gemini, user_keys["gemini"]))
        if "claude" in user_keys:
            tasks.append(execute_model("claude", call_claude, user_keys["claude"]))

        # gather ==> 병렬 시행
        results = await asyncio.gather(*tasks, return_exceptions=False)

        for r in results:
            # if r.error is None:
                await self.ai_response_repository.create(
                    message_id=message_id,
                    model=r.model,
                    content=r.result,
                    latency_ms=r.latency_ms,
                    error=r.error
                )

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


    # 채팅 원장 기록
    async def get_chat(self, account_id: int) -> list:
        chat_history = await self.chat_session_repository.find_by_account_id(account_id)
        if not chat_history:
            return []
        return [
            {
                "id": s.id,
                "title": s.title,
            }
            for s in chat_history
        ]

    # 각 채팅 기록에 대한 상세(해당 채팅에서 실제로 나눳던 대화 내용들)
    async def get_chat_messages(self, account_id: int, session_id: int) -> list:
        session = await self.chat_session_repository.find_by_id(session_id)
        if not session or session.account_id != account_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="채팅(내역)을 찾을 수 없습니다."
            )

        messages = await self.chat_message_repository.find_by_session_id(session_id)
        result = []

        for message in messages:
            responses = await self.ai_response_repository.find_by_message_id(message.id)
            result.append({
                "message_id": message.id,
                "role": message.role,
                "input_order": message.input_order,
                "selected_model": message.selected_model,
                "content_type": message.content_type,
                "content": message.content,
                "file_url": message.file_url,
                "mime_type": message.mime_type,
                "results": [
                    {
                        "model": r.model,
                        "result": r.content,
                        "error": r.error,
                        "latency_ms": r.latency_ms,
                    }
                    for r in responses
                ]
            })

        return result

def parse_error_msg(model_name: str, error_msg: str) -> str:
    if "401" in error_msg:
        return f"{model_name.upper()} API 키가 올바르지 않습니다. 설정에서 확인해주세요."
    if "400" in error_msg:
        return f"{model_name.upper()} API 키가 올바르지 않습니다. 설정에서 확인해주세요."
    if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "Quota" in error_msg:
        return f"{model_name.upper()} API 사용량이 초과되었습니다. 플랜 및 할당량을 확인해주세요."
    if "503" in error_msg or "UNAVAILABLE" in error_msg:
        return f"{model_name.upper()} 서버가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요."
    return f"{model_name.upper()} 응답 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."