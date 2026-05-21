from nemoguardrails import LLMRails
from nemoguardrails import RailsConfig

from util.result_process import check_llm_verdict

# NeMo 설정 로드
config = RailsConfig.from_path("./config")

# Runtime 생성
rails = LLMRails(config)

rails.register_action(check_llm_verdict, name="check_llm_verdict")
