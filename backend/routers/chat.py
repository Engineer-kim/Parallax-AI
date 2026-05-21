from fastapi import APIRouter
import uuid
import asyncio
import time

from models.request import ParallaxRequest
from models.response import ParallaxResponse, ResponseStatus, ModelResult
from services.harness_service import harness_check
from services.llm_service import call_gpt, call_gemini, call_claude
from services.nemo_service import rails

router = APIRouter()


@router.post("/chat", response_model=ParallaxResponse)
async def chat(data: ParallaxRequest):

    request_id = str(uuid.uuid4())
    start = time.perf_counter()

    user_input = data.content or ""

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

    gpt_task = call_gpt(clean_input)
    gemini_task = call_gemini(clean_input)
    claude_task = call_claude(clean_input)

    gpt, gemini, claude = await asyncio.gather(
        gpt_task,
        gemini_task,
        claude_task
    )

    latency = (time.perf_counter() - start) * 1000

    return ParallaxResponse(
        status=ResponseStatus.SUCCESS,
        request_id=request_id,
        results=[
            ModelResult(model="gpt", result=gpt, latency_ms=latency),
            ModelResult(model="gemini", result=gemini, latency_ms=latency),
            ModelResult(model="claude", result=claude, latency_ms=latency),
        ]
    )