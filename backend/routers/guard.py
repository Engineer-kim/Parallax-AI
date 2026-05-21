from dotenv import load_dotenv
load_dotenv()

from fastapi import APIRouter
from nemoguardrails import LLMRails, RailsConfig

router = APIRouter()

config = RailsConfig.from_path("./guardrails_config")
rails = LLMRails(config)

@router.post("/check")
async def check_guard(data: dict):

    result = await rails.generate_async(
        messages=[
            {
                "role": "user",
                "content": data["message"]
            }
        ]
    )

    print(result)