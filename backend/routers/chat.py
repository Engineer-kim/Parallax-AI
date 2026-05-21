from fastapi import APIRouter

router = APIRouter()

@router.post("/chat")
async def chat(data: dict):

    user_input = data["message"]

    blocked = harness_check(user_input)

    if blocked:
        return {
            "blocked": True
        }
    response = await rails.generate_async(
        messages=[
            {
                "role": "user",
                "content": user_input
            }
        ]
    )

    return response