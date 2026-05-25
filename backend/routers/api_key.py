from fastapi import APIRouter, Depends, status, Response, HTTPException
from sqlalchemy.orm import Session

from schemas.api_key_req_res import ApiKeyRequest, ApiKeyResponse
from repositories.user_api_key_repository import UserApiKeyRepository
from util.database import connect_db
from util.auth_middleware import get_current_account_id

router = APIRouter()


@router.post("/save", response_model=ApiKeyResponse, status_code=status.HTTP_200_OK)
def upsert_api_key(
    data: ApiKeyRequest,
    account_id: int = Depends(get_current_account_id),
    db: Session = Depends(connect_db)
):
    try:
        if not data.api_key or data.api_key.strip() == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="API 키를 입력해주세요."
            )
        repo = UserApiKeyRepository(db)
        repo.upsert(account_id=account_id, model=data.model, api_key=data.api_key)
        return ApiKeyResponse(model=data.model, registered=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{model}", status_code=status.HTTP_200_OK)
def delete_api_key(
    model: str,
    account_id: int = Depends(get_current_account_id),
    db: Session = Depends(connect_db)
):
    try:
        repo = UserApiKeyRepository(db)
        deleted = repo.delete(account_id=account_id, model=model)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="등록된 키가 없습니다."
            )
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/registered", response_model=list[str])
def get_registered_models(
    account_id: int = Depends(get_current_account_id),
    db: Session = Depends(connect_db)
):
    try:
        repo = UserApiKeyRepository(db)
        return repo.find_registered_models(account_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )