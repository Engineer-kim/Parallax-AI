from fastapi import APIRouter
from fastapi import status
from fastapi import Response
from fastapi import Depends

import uuid
import base64

from sqlalchemy.orm import Session

from enums.auth_enum import Auth
from models import account
from schemas.request import ParallaxRequest
from schemas.response import ParallaxResponse, ModelResult
from schemas.response import ResponseStatus

from services.harness_service import harness_check
from services.nemo_service import rails
from services.chat_service import ChatService

from util.check_result_after_gaurd_rail import check_if_refused_by_llm
from util.database import connect_db

router = APIRouter()


@router.post("/chat", response_model=ParallaxResponse)
async def chat(data: ParallaxRequest,response: Response,db: Session = Depends(connect_db)):

    request_id = str(uuid.uuid4())

    user_input = data.content or ""

    if data.file_data:

        try:

            file_text = (
                base64
                .b64decode(data.file_data)
                .decode("utf-8", errors="ignore")
            )

            user_input = (
                f"{user_input}\n\n"
                f"[첨부파일: {data.file_name}]\n"
                f"{file_text}"
            )

        except Exception:
            pass

    if harness_check(user_input):

        response.status_code = status.HTTP_406_NOT_ACCEPTABLE

        return ParallaxResponse(
            status=ResponseStatus.BLOCKED,
            request_id=request_id,
            message="blocked by rule.json",
            results=[]
        )

    rail_result = await rails.generate_async(
        messages=[
            {
                "role": "user",
                "content": user_input
            }
        ]
    )

    print(f"rail_result: {rail_result}")

    if not rail_result:

        response.status_code = status.HTTP_406_NOT_ACCEPTABLE

        return ParallaxResponse(
            status=ResponseStatus.BLOCKED,
            request_id=request_id,
            message="empty response",
            results=[]
        )

    rail_content = ""

    if isinstance(rail_result, dict):

        rail_content = rail_result.get("content", "")

    elif hasattr(rail_result, "content"):

        rail_content = rail_result.content

    if await check_if_refused_by_llm(rail_content):

        response.status_code = status.HTTP_406_NOT_ACCEPTABLE

        return ParallaxResponse(
            status=ResponseStatus.BLOCKED,
            request_id=request_id,
            message="violate req is blocked by nemo guardrail",
            results=[]
        )

    chat_service = ChatService(db)

    message = await chat_service.save_user_message(
        account_id=data.account_id,
        session_id=data.session_id,
        role=Auth.ROLE_USER,
        input_order=data.input_order,
        selected_model=data.selected_model,
        content_type=data.content_type,
        content=data.content,
        file_url=data.file_url,
        mime_type=data.mime_type
    )

    ai_results = await chat_service.process_ai_response(
        message_id=message.id,
        prompt=user_input
    )

    return ParallaxResponse(
        status=ResponseStatus.SUCCESS,
        request_id=request_id,
        results=ai_results
    )