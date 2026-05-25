import os
import jwt
from fastapi import Request, status, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


class AuthFilterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        #Preflight 허용(브라우저 확인용 요청)
        if request.method == "OPTIONS":
            return await call_next(request)


        if request.url.path.startswith("/start/chat") or request.url.path.startswith("/keys"):

            token = None
            # auth_header = request.headers.get("Authorization")
            #
            # if not auth_header or not auth_header.startswith("Bearer "):
            #     return JSONResponse(
            #         status_code=status.HTTP_401_UNAUTHORIZED,
            #         content={"detail": "로그인 정보가 필요합니다."}                )
            #
            # token = auth_header.split(" ")[1]
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

            if not token:
                token = request.cookies.get("access_token")

            if not token:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "로그인 정보가 필요합니다."}
                )

            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                if payload.get("type") != "access":
                    return JSONResponse(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        content={"detail": "인증에 실패했습니다"}
                    )
                request.state.user = payload
            except jwt.PyJWTError:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "인증에 실패했습니다."}
                )

        response = await call_next(request)
        return response

def get_current_account_id(request: Request) -> int:
    user = getattr(request.state, "user", None)
    # {
    #     "sub": "1", => account테이블의 id
    #     "role": "USER",
    #     "exp": 1234567890,
    #     "type": "access"
    # }

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인 정보가 필요합니다."
        )
    return int(user.get("sub"))