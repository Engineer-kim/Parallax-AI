import os


import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

connect_redis = redis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True
)