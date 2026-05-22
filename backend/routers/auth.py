from fastapi import HTTPException, status, Depends, APIRouter
from fastapi.responses import JSONResponse

from schemas.login_request import LoginRequest
from schemas.sign_up_request import SignUpRequest
from services.auth_service import AuthService

router = APIRouter()


@router.post("/signup", status_code=status.HTTP_200_OK)
async def signup(request: SignUpRequest, auth_service: AuthService = Depends()):
    await auth_service.sign_up(request)
    return {"message": "Success"}


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(request: LoginRequest, auth_service: AuthService = Depends()):
    token, role = await auth_service.login(request)

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Login success"}
    )
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=1800
    )
    return response


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(auth_service: AuthService = Depends()):
    await auth_service.logout()

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Logout success"}
    )
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return response