import os

from dotenv import load_dotenv

from nemoguardrails import LLMRails
from nemoguardrails import RailsConfig
from pathlib import Path


load_dotenv()

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

# NeMo 설정 로드
CONFIG_PATH = Path(__file__).parent.parent / "config"

# Runtime 생성
config = RailsConfig.from_path(str(CONFIG_PATH))
rails = LLMRails(config)