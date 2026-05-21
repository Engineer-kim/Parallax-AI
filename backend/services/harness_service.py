import json
import re
from pathlib import Path


RULE_PATH = Path("config/rule.json")


with open(RULE_PATH, "r", encoding="utf-8") as f:
    RULE_CONFIG = json.load(f)


RULES = RULE_CONFIG["rules"]
SETTINGS = RULE_CONFIG["settings"]


BLOCK_SEVERITY = set(
    SETTINGS["block_on_severity"]
)


def harness_check(user_input: str) -> bool:

    if len(user_input) > SETTINGS["max_text_length"]:
        return True

    text = user_input.lower()

    for rule in RULES:

        rule_type = rule["type"]
        value = rule["value"].lower()
        severity = rule["severity"]

        matched = False

        if rule_type == "keyword":

            if value in text:
                matched = True

        elif rule_type == "regex":

            if re.search(
                value,
                user_input,
                re.IGNORECASE
            ):
                matched = True

        if matched and severity in BLOCK_SEVERITY:
            return True

    return False