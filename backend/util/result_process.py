from nemoguardrails.actions import action


@action(name="check_llm_verdict")
async def check_llm_verdict(context: dict = None):
    if context is None:
        return True

    llm_response = context.get("last_action_output") or context.get("action_policy_output")

    if llm_response is None:
        return True

    cleaned = str(llm_response).lower().strip()

    if not cleaned:
        return True

    if "yes" in cleaned:
        return True

    if "no" in cleaned:
        return False

    return True