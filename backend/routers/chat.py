from dotenv import load_dotenv
load_dotenv()


import uuid
import time
from fastapi import APIRouter

from models.request import ParallaxRequest
from models.response import ParallaxResponse, ResponseStatus, ModelResult
from services.harness_service import harness_check
from services.nemo_service import rails

router = APIRouter()

@router.post("/chat",response_model=ParallaxResponse)
async def chat(data: ParallaxRequest):

    request_id = str(uuid.uuid4())

    start = time.perf_counter()

    user_input = data.content or ""

    blocked = harness_check(user_input)

    print(blocked)

    if blocked:
        return ParallaxResponse(
            status=ResponseStatus.BLOCKED,
            request_id=request_id,
            message="잘못된 요청입니다.",
            results=[]
        )

    try:
        response = await rails.generate_async(
            messages=[
                {
                    "role": "user",
                    "content": user_input
                }
            ]
        )

        print("TYPE:", type(response))
        print("RAW:", response)

        try:
            print("DIR:", dir(response))
        except:
            pass


        latency = ( time.perf_counter() - start) * 1000

        return ParallaxResponse(
            status=ResponseStatus.SUCCESS,
            request_id=request_id,
            results=[
                ModelResult(
                    model="nemo-groq",
                    result=response["content"],
                    latency_ms=latency
                )
            ]
        )

    except Exception as e:

        return ParallaxResponse(
            status=ResponseStatus.ERROR,
            request_id=request_id,
            message=str(e),
            results=[]
        )