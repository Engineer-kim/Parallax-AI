from fastapi import APIRouter, Depends, status, HTTPException

from schemas.api_key_req_res import ApiKeyRequest, ApiKeyResponse
from services.api_key_service import ApiKeyService
from util.auth_middleware import get_current_account_id

router = APIRouter()


@router.post("/save", response_model=ApiKeyResponse, status_code=status.HTTP_200_OK)
async def upsert_api_key(
    data: ApiKeyRequest,
    account_id: int = Depends(get_current_account_id),
    api_key_service: ApiKeyService = Depends()
):
    try:
        if not data.api_key or data.api_key.strip() == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="API 키를 입력해주세요."
            )

        await api_key_service.upsert_api_key(
            account_id=account_id,
            model=data.model,
            api_key=data.api_key
        )

        return ApiKeyResponse(model=data.model, registered=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{model}", status_code=status.HTTP_200_OK)
async def delete_api_key(
    model: str,
    account_id: int = Depends(get_current_account_id),
    api_key_service: ApiKeyService = Depends()
):
    try:

        deleted = await api_key_service.delete_api_key(
            account_id=account_id,
            model=model
        )

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
async def get_registered_models(
    account_id: int = Depends(get_current_account_id),
    api_key_service: ApiKeyService = Depends()
):
    try:
        return await api_key_service.get_registered_models(account_id)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )