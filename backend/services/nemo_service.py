from nemoguardrails import LLMRails
from nemoguardrails import RailsConfig

# NeMo 설정 로드
config = RailsConfig.from_path("./config")

# Runtime 생성
rails = LLMRails(config)