from nemoguardrails.actions import action


@action(name="check_llm_verdict")
async def check_llm_verdict(context: dict = None):

    if not context:
        return True

    user_msg = context.get("messages", [{}])[-1].get("content", "")

    text = user_msg.lower()

    banned = [
        "hack",
        "inject",
        "ignore instructions",
        "bypass"
    ]

    for b in banned:
        if b in text:
            return False

    return True