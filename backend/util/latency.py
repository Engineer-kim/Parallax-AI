import time
from schemas.response import ModelResult

async def call_with_latency(name: str, coro):
    start = time.perf_counter()
    try:
        result = await coro
        latency = (time.perf_counter() - start) * 1000
        return ModelResult(model=name, result=result, latency_ms=latency)
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        return ModelResult(model=name, result=None, error=str(e), latency_ms=latency)
