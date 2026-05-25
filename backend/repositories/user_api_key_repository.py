from sqlalchemy.orm import Session
from models.user_api_key import UserApiKey
from util.crypto import encrypt


class UserApiKeyRepository:

    def __init__(self, db: Session):
        self.db = db

    def find_by_account_id(self, account_id: int) -> dict:
        rows = (
            self.db.query(UserApiKey)
            .filter(UserApiKey.account_id == account_id)
            .all()
        )
        return {row.model: row.api_key for row in rows}

    def upsert(self, account_id: int, model: str, api_key: str) -> UserApiKey:
        row = (
            self.db.query(UserApiKey)
            .filter(
                UserApiKey.account_id == account_id,
                UserApiKey.model == model
            )
            .first()
        )
        if row:
            row.api_key = encrypt(api_key)
        else:
            row = UserApiKey(
                account_id=account_id,
                model=model,
                api_key=encrypt(api_key)
            )
            self.db.add(row)

        self.db.commit()
        self.db.refresh(row)
        return row

    def delete(self, account_id: int, model: str) -> bool:
        row = (
            self.db.query(UserApiKey)
            .filter(
                UserApiKey.account_id == account_id,
                UserApiKey.model == model
            )
            .first()
        )
        if not row:
            return False
        self.db.delete(row)
        self.db.commit()
        return True

    def find_registered_models(self, account_id: int) -> list[str]:
        rows = (
            self.db.query(UserApiKey.model)
            .filter(UserApiKey.account_id == account_id)
            .all()
        )
        return [row.model for row in rows]
