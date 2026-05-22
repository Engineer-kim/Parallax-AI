from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from models.account import Account
from util.security import PasswordEncoder, TokenProvider




@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(request: SignUpRequest, db: AsyncSession = Depends(get_db)):
    user_repository = UserRepository(db)

    existing_user = await user_repository.find_by_login_id(request.login_id)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already exists"
        )

    hashed_password = PasswordEncoder.encode(request.password)
    new_account = Account(
        login_id=request.login_id,
        password=hashed_password,
        nickname=request.nickname,
        role=request.role
    )

    await user_repository.save(new_account)
    return {"message": "Success"}


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    user_repository = UserRepository(db)

    account = await user_repository.find_by_login_id(request.login_id)
    if not account or not PasswordEncoder.matches(request.password, account.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    token = TokenProvider.create_access_token(subject=account.login_id, role=account.role)

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
async def logout():
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