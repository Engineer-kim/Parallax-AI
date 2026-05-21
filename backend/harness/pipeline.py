import re
import json
import filetype
from pathlib import Path
from models.request import ParallaxRequest, InputType
from parser import parse_content
from harness.nemo_harness import run_nemo_input_check

RULES_PATH = Path(__file__).parent / "rules.json"
with open(RULES_PATH, "r", encoding="utf-8") as f:
    _RULES_DATA = json.load(f)

RULES = _RULES_DATA["rules"]
SETTINGS = _RULES_DATA["settings"]
BLOCK_SEVERITIES = set(SETTINGS["block_on_severity"])
MAX_TEXT_LENGTH = SETTINGS["max_text_length"]
MAX_FILE_SIZE = SETTINGS["max_file_size_mb"] * 1024 * 1024


class PipelineResult:
    def __init__(self, passed: bool, rule_id: str = None, reason: str = None):
        self.passed = passed
        self.rule_id = rule_id
        self.reason = reason


def stage_validate_structure(request: ParallaxRequest) -> PipelineResult:
    if request.input_type == InputType.TEXT:
        if not request.content or request.content.strip() == "":
            return PipelineResult(False, "S001", "텍스트 내용이 비어있습니다")
    if request.input_type in [InputType.FILE, InputType.IMAGE, InputType.VIDEO]:
        if not request.file_data or len(request.file_data) == 0:
            return PipelineResult(False, "S002", "파일 데이터가 비어있습니다")
        if not request.file_name:
            return PipelineResult(False, "S003", "파일명이 없습니다")
        if len(request.file_data) > MAX_FILE_SIZE:
            return PipelineResult(False, "S004", f"파일 크기 초과")
    return PipelineResult(True)


def stage_validate_file_signature(request: ParallaxRequest) -> PipelineResult:
    if request.input_type == InputType.TEXT:
        return PipelineResult(True)
    file_data = request.file_data
    file_name = request.file_name.lower()
    ext = "." + file_name.rsplit(".", 1)[-1] if "." in file_name else ""
    for rule in RULES:
        if rule["type"] == "file_ext" and rule["value"] == ext:
            return PipelineResult(False, rule["id"], f"차단된 파일 형식: {ext}")
    kind = filetype.guess(file_data)
    if kind:
        if request.input_type == InputType.IMAGE and not kind.mime.startswith("image/"):
            return PipelineResult(False, "S005", f"확장자 변조 의심: {kind.mime}")
        if request.input_type == InputType.VIDEO and not kind.mime.startswith("video/"):
            return PipelineResult(False, "S006", f"확장자 변조 의심: {kind.mime}")
    return PipelineResult(True)


def stage_parse_content(request: ParallaxRequest) -> tuple[PipelineResult, str]:
    try:
        content = parse_content(request)
        return PipelineResult(True), content
    except Exception as e:
        return PipelineResult(False, "S007", f"파싱 실패: {str(e)}"), ""


def stage_rule_engine(content: str) -> PipelineResult:
    for rule in RULES:
        if rule["type"] not in ["keyword", "regex"]:
            continue
        if rule["severity"] not in BLOCK_SEVERITIES:
            continue
        if rule["type"] == "keyword":
            if rule["value"].lower() in content.lower():
                return PipelineResult(False, rule["id"], f"차단 키워드: {rule['value']}")
        if rule["type"] == "regex":
            if re.search(rule["value"], content, re.IGNORECASE):
                return PipelineResult(False, rule["id"], f"악성 패턴 감지 ({rule['id']})")
    return PipelineResult(True)


def stage_token_limit(content: str) -> PipelineResult:
    if len(content) > MAX_TEXT_LENGTH:
        return PipelineResult(False, "S008", f"내용 초과 (최대 {MAX_TEXT_LENGTH}자)")
    return PipelineResult(True)


async def stage_nemo_check(content: str) -> PipelineResult:
    result = await run_nemo_input_check(content)
    if not result["passed"]:
        return PipelineResult(False, "N001", result["reason"])
    return PipelineResult(True)


async def run_pipeline(request: ParallaxRequest) -> PipelineResult:
    result = stage_validate_structure(request)
    if not result.passed:
        return result

    result = stage_validate_file_signature(request)
    if not result.passed:
        return result

    result, content = stage_parse_content(request)
    if not result.passed:
        return result

    result = stage_rule_engine(content)
    if not result.passed:
        return result

    result = stage_token_limit(content)
    if not result.passed:
        return result

    result = await stage_nemo_check(content)
    if not result.passed:
        return result

    return PipelineResult(True)