from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal, User, Game, SolvedPuzzles
from datetime import datetime, UTC
from auth import get_current_user

router = APIRouter(
    prefix="/game",
    tags=["game"]
)

class SaveGameRequest(BaseModel):
    user_id: int
    opponent_type: str
    player_color: str
    result: str  # win, loss, draw
    depth: int
    moves_count: int

class GameStatsResponse(BaseModel):
    total_games: int
    wins: int
    losses: int
    draws: int
    win_rate: float
    puzzles_solved: int

class RecentGameResponse(BaseModel):
    id: int
    opponent_type: str
    player_color: str
    result: str
    depth: int
    moves_count: int
    played_at: datetime

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/save", status_code=status.HTTP_201_CREATED)
def save_game(db: db_dependency, game_request: SaveGameRequest):
    """Save a completed game"""
    
    user = db.query(User).filter(User.id == game_request.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    new_game = Game(
        user_id=game_request.user_id,
        opponent_type=game_request.opponent_type,
        player_color=game_request.player_color,
        result=game_request.result,
        depth=game_request.depth,
        moves_count=game_request.moves_count,
        played_at=datetime.now(UTC)
    )
    
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    
    return {"message": "Game saved successfully", "game_id": new_game.id}

@router.get("/stats/{user_id}", response_model=GameStatsResponse)
def get_game_stats(user_id: int, db: db_dependency):
    """Get game statistics for a user"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Get game statistics
    total_games = db.query(Game).filter(Game.user_id == user_id).count()
    wins = db.query(Game).filter(Game.user_id == user_id, Game.result == "win").count()
    losses = db.query(Game).filter(Game.user_id == user_id, Game.result == "loss").count()
    draws = db.query(Game).filter(Game.user_id == user_id, Game.result == "draw").count()
    
    # Calculate win rate
    win_rate = (wins / total_games * 100) if total_games > 0 else 0.0
    
    # Get puzzles solved count
    puzzles_solved = db.query(SolvedPuzzles).filter(SolvedPuzzles.user_id == user_id).count()
    
    return GameStatsResponse(
        total_games=total_games,
        wins=wins,
        losses=losses,
        draws=draws,
        win_rate=round(win_rate, 1),
        puzzles_solved=puzzles_solved
    )

@router.get("/recent/{user_id}", response_model=List[RecentGameResponse])
def get_recent_games(user_id: int, db: db_dependency, limit: int = 10):
    """Get recent games for a user"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Get recent games ordered by played_at descending
    recent_games = db.query(Game).filter(
        Game.user_id == user_id
    ).order_by(Game.played_at.desc()).limit(limit).all()
    
    return recent_games
