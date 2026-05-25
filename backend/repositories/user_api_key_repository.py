from sqlalchemy.orm import Session
from models.user_api_key import UserApiKey


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