import os

from fastapi import HTTPException, status
from openai import AsyncOpenAI
import httpx
from openai.types.chat import ChatCompletionUserMessageParam
# from dotenv import load_dotenv
#
# load_dotenv()
# openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def call_gpt(prompt: str, api_key: str):
    # key = os.getenv("GPT_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="키가 설정되지 않았습니다. 설정을 확인하세요.(GPT)"
        )

    openai_client = AsyncOpenAI(api_key=api_key)

    user_message: ChatCompletionUserMessageParam = {
        "role": "user",
        "content": prompt,
    }

    res = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[user_message],
        timeout=30.0,
    )

    return res.choices[0].message.content


async def call_gemini(prompt: str, api_key: str):
    # key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = "키가 설정되지 않았습니다. 설정을 확인하세요.(GEMINI)"
        )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, json=payload)

        if r.status_code != 200:
            raise Exception(r.text)

        data = r.json()

    return data["candidates"][0]["content"]["parts"][0]["text"]



async def call_claude(prompt: str, api_key: str):
    # key = os.getenv("CLAUDE_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = "키가 설정되지 않았습니다. 설정을 확인하세요.(CLAUDE)"
        )
    url = "https://api.anthropic.com/v1/messages"

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}],
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            raise Exception(f"Claude API 에러: {response.status_code} - {response.text}")

        data = response.json()

    return data["content"][0]["text"]