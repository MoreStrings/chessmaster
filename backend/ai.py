from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, User
from auth import get_current_user
from typing import Annotated
from pydantic import BaseModel  # <-- make sure to import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

db_dependency = Annotated[Session, Depends(lambda: SessionLocal())]
user_dependency = Annotated[dict, Depends(get_current_user)]

class AIGameResult(BaseModel):
    won: bool  # True if user won, False if lost/draw

@router.post("/finish")
def finish_ai_game(result: AIGameResult, db: db_dependency, user: user_dependency):
    db_user = db.query(User).filter(User.id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.total_ai_games += 1
    if result.won:
        db_user.ai_games_won += 1

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "total_ai_games": db_user.total_ai_games,
        "ai_games_won": db_user.ai_games_won
    }
