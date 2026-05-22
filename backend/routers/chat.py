from fastapi import APIRouter
import uuid
import asyncio

from models.request import ParallaxRequest
from models.response import ParallaxResponse, ResponseStatus, ModelResult
from services.harness_service import harness_check
from services.llm_service import call_gpt, call_gemini, call_claude
from services.nemo_service import rails
from util.latency import call_with_latency
import base64

router = APIRouter()


@router.post("/chat", response_model=ParallaxResponse)
async def chat(data: ParallaxRequest):

    request_id = str(uuid.uuid4())

    user_input = data.content or ""

    if data.file_data:
        try:
            file_text = base64.b64decode(data.file_data).decode("utf-8", errors="ignore")
            user_input = f"{user_input}\n\n[첨부파일: {data.file_name}]\n{file_text}"
        except Exception:
            pass

    if harness_check(user_input):
        return ParallaxResponse(
            status=ResponseStatus.BLOCKED,
            request_id=request_id,
            message="blocked by rule.json",
            results=[]
        )

    rail_result = await rails.generate_async(
        messages=[{"role": "user", "content": user_input}]
    )

    if not rail_result:
        return ParallaxResponse(
            status=ResponseStatus.BLOCKED,
            request_id=request_id,
            message="blocked by nemo",
            results=[]
        )

    clean_input = user_input

    results = await asyncio.gather(
        call_with_latency("gpt", call_gpt(clean_input)),
        call_with_latency("gemini", call_gemini(clean_input)),
        call_with_latency("claude", call_claude(clean_input)),
    )

    return ParallaxResponse(
        status=ResponseStatus.SUCCESS,
        request_id=request_id,
        results=list(results)
    )

