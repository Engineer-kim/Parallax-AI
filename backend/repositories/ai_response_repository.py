from sqlalchemy.orm import Session

from models.ai_response import AIResponse


class AIResponseRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        message_id: int,
        model: str,
        content: str,
        latency_ms: int = None
    ):

        response = AIResponse(
            message_id=message_id,
            model=model,
            content=content,
            latency_ms=latency_ms
        )

        self.db.add(response)
        self.db.commit()
        self.db.refresh(response)

        return response

    def find_by_message_id(self, message_id: int):

        return (
            self.db.query(AIResponse)
            .filter(AIResponse.message_id == message_id)
            .all()
        )

    def delete_by_message_id(self, message_id: int):

        responses = (
            self.db.query(AIResponse)
            .filter(AIResponse.message_id == message_id)
            .all()
        )

        for response in responses:
            self.db.delete(response)

        self.db.commit()

        return True