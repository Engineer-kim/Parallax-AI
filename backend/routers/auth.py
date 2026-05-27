from fastapi import HTTPException, status, Depends, APIRouter, Request, Response
from fastapi.responses import JSONResponse

from config import IS_PROD, COOKIE_DOMAIN
from schemas.login_request import LoginRequest
from schemas.sign_up_request import SignUpRequest
from services.auth_service import AuthService
from util.auth_middleware import get_current_account_id
from util.security import get_current_user

router = APIRouter()


@router.post("/signup", status_code=status.HTTP_200_OK)
async def signup(request: SignUpRequest, auth_service: AuthService = Depends()):
    await auth_service.sign_up(request)
    return {"message": "Success"}


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(request: LoginRequest, auth_service: AuthService = Depends()):
    token, role, id, refresh_token = await auth_service.login(request)

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Login success",
            "role": role,
            "account_id": id
        }
    )
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=IS_PROD,
        samesite="none" if IS_PROD else "lax",
        max_age=1800,
        path="/",
        domain=COOKIE_DOMAIN
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=IS_PROD,
        samesite="none" if IS_PROD else "lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
        domain=COOKIE_DOMAIN
    )

    return response


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: dict = Depends(get_current_user),auth_service: AuthService = Depends()):

    account_id = current_user.get("sub")

    if not isinstance(account_id, str):
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    await auth_service.logout(account_id)

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Logout success"}
    )

    response.delete_cookie(
        key="access_token",
        path="/",
        domain=COOKIE_DOMAIN,
        httponly=True,
        secure=IS_PROD,
        samesite="none" if IS_PROD else "lax"
    )
    response.delete_cookie(
        key="refresh_token",
        path="/",
        domain=COOKIE_DOMAIN,
        httponly=True,
        secure=IS_PROD,
        samesite="none" if IS_PROD else "lax"
    )

    return response

@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh(request: Request,auth_service: AuthService = Depends()):

    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh token not found"
        )

    new_access_token = await auth_service.refresh(refresh_token)

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Token refreshed"}
    )

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=IS_PROD,
        samesite="none" if IS_PROD else "lax",
        max_age=1800,
        domain=COOKIE_DOMAIN
    )

    return response

@router.delete("/account", status_code=status.HTTP_200_OK)
async def delete_account(
    response: Response,
    account_id: str = Depends(get_current_account_id),
    auth_service: AuthService = Depends()
):
    try:
        await auth_service.delete_account(account_id)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return {"account_deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )