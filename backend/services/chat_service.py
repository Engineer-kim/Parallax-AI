import asyncio
import time

from repositories.chat_message_repository import ChatMessageRepository
from repositories.ai_response_repository import AIResponseRepository

from services.llm_service import call_gpt
from services.llm_service import call_gemini
from services.llm_service import call_claude


class ChatService:

    def __init__(self, db):

        self.chat_message_repository = ChatMessageRepository(db)
        self.ai_response_repository = AIResponseRepository(db)

    async def save_user_message(
        self,
        session_id: int,
        role: str,
        input_order: int,
        selected_model: str,
        content_type: str,
        content: str = None,
        file_url: str = None,
        mime_type: str = None
    ):

        return self.chat_message_repository.create(
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
        prompt: str
    ):

        started = time.perf_counter()

        gpt_task = call_gpt(prompt)
        gemini_task = call_gemini(prompt)
        claude_task = call_claude(prompt)

        gpt_result, gemini_result, claude_result = await asyncio.gather(
            gpt_task,
            gemini_task,
            claude_task
        )

        latency = int((time.perf_counter() - started) * 1000)

        self.ai_response_repository.create(
            message_id=message_id,
            model="gpt",
            content=gpt_result,
            latency_ms=latency
        )

        self.ai_response_repository.create(
            message_id=message_id,
            model="gemini",
            content=gemini_result,
            latency_ms=latency
        )

        self.ai_response_repository.create(
            message_id=message_id,
            model="claude",
            content=claude_result,
            latency_ms=latency
        )

        return {
            "gpt": gpt_result,
            "gemini": gemini_result,
            "claude": claude_result
        }

    async def select_model(
        self,
        message_id: int,
        selected_model: str
    ):

        return self.chat_message_repository.update_selected_model(
            message_id=message_id,
            selected_model=selected_model
        )

    async def get_chat_history(
        self,
        session_id: int
    ):

        messages = self.chat_message_repository.find_by_session_id(
            session_id=session_id
        )

        result = []

        for message in messages:

            responses = self.ai_response_repository.find_by_message_id(
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
                        "latency_ms": response.latency_ms
                    }
                    for response in responses
                ]
            })

        return result