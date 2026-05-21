import os
from openai import OpenAI
import httpx

# openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


async def call_gpt(prompt: str):
    # res = openai_client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=[{"role": "user", "content": prompt}]
    # )
    # return res.choices[0].message.content
    return "sss"


async def call_gemini(prompt: str):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

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



async def call_claude(prompt: str):
    # async with httpx.AsyncClient() as client:
    #     r = await client.post(
    #         "CLAUDE_API_ENDPOINT",
    #         json={"prompt": prompt}
    #     )
    # return r.json()["text"]
    return "sss"