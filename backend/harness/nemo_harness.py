from nemoguardrails import LLMRails, RailsConfig
from pathlib import Path

CONFIG_PATH = Path(__file__).parent.parent / "guardrails_config"

config = RailsConfig.from_path(str(CONFIG_PATH))
rails = LLMRails(config)


async def run_nemo_input_check(content: str) -> dict:
    try:
        response = await rails.generate_async(
            messages=[{"role": "user", "content": content}]
        )
        blocked_phrases = [
            "처리할 수 없습니다",
            "부적절한 표현",
            "해당 콘텐츠",
        ]
        is_blocked = any(phrase in response for phrase in blocked_phrases)

        return {
            "passed": not is_blocked,
            "reason": response if is_blocked else None,
        }
    except Exception as e:
        return {"passed": False, "reason": str(e)}


async def run_nemo_output_check(content: str) -> dict:
    try:
        response = await rails.generate_async(
            messages=[
                {"role": "user", "content": "__output_check__"},
                {"role": "assistant", "content": content},
            ]
        )
        blocked_phrases = [
            "응답을 생성할 수 없습니다",
            "정확하지 않을 수 있습니다",
        ]
        is_blocked = any(phrase in response for phrase in blocked_phrases)

        return {
            "passed": not is_blocked,
            "reason": response if is_blocked else None,
        }
    except Exception as e:
        return {"passed": False, "reason": str(e)}