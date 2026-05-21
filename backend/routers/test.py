from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def compare():
    return {"서버 상태 체크": "Good to Go"}
