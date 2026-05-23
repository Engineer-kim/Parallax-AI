from datetime import datetime
from zoneinfo import ZoneInfo

_KST_ZONE = ZoneInfo("Asia/Seoul")

def KST():
    return datetime.now(_KST_ZONE).replace(tzinfo=None)