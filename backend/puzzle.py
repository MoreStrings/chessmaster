import random
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import SessionLocal, User, Puzzle, SolvedPuzzles, SolvedPuzzleTheme
from datetime import datetime, UTC
from auth import get_current_user

RATING_WINDOW = 150
MAX_ATTEMPTS = 20

router = APIRouter(
    prefix="/puzzle",
    tags=["puzzle"]
)

class PuzzleResponse(BaseModel):
    PuzzleId: str
    FEN: str
    Moves: str
    Rating: int

class PuzzleRequest(BaseModel):
    user_id: int

class SolveRequest(BaseModel):
    user_id: int
    puzzle_id: str
    solve_time_seconds: int
    hints_used: bool
    mistakes_made: bool

class SolveResponse(BaseModel):
    new_rating: int

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/next", response_model=PuzzleResponse)
def get_puzzle(db: db_dependency, puzzle_request: PuzzleRequest):
    
    user = db.query(User).filter(User.id == puzzle_request.user_id).first()

    solved_subquery = db.query(SolvedPuzzles.puzzle_id).filter(SolvedPuzzles.user_id == user.id)
    count = db.query(Puzzle).filter(~Puzzle.PuzzleId.in_(solved_subquery)).count()
    if count == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puzzles found")
    
    for _ in range(MAX_ATTEMPTS):
        offset = random.randint(0, count - 1)
        puzzle = db.query(Puzzle).filter(~Puzzle.PuzzleId.in_(solved_subquery)).offset(offset).first()

        if abs(puzzle.Rating - user.puzzle_rating) <= RATING_WINDOW:
             return PuzzleResponse(
                PuzzleId=puzzle.PuzzleId,
                FEN=puzzle.FEN,
                Moves=puzzle.Moves,
                Rating=puzzle.Rating,
            )
    
    #fallback
    puzzle = (
        db.query(Puzzle)
        .filter(~Puzzle.PuzzleId.in_(solved_subquery))
        .order_by(func.abs(Puzzle.Rating - user.puzzle_rating))
        .first()
    )

    return PuzzleResponse(
        PuzzleId=puzzle.PuzzleId,
        FEN=puzzle.FEN,
        Moves=puzzle.Moves,
        Rating=puzzle.Rating,
    )   
   

@router.post("/solve", response_model=SolveResponse)
def solve_puzzle(db: db_dependency, solve_request: SolveRequest):

    user = db.query(User).filter(User.id == solve_request.user_id).first()

    create_solved_puzzle = SolvedPuzzles(
        user_id = solve_request.user_id,
        puzzle_id = solve_request.puzzle_id,
        solved_at = datetime.now(UTC),
        solve_time_seconds = solve_request.solve_time_seconds,
        hint_used = solve_request.hints_used,
        mistakes_made = solve_request.mistakes_made,
    )

    delta_rating = 0

    if solve_request.mistakes_made:
        delta_rating -= 16
    if solve_request.hints_used and not solve_request.mistakes_made:
        delta_rating -= 8
    if not solve_request.hints_used and not solve_request.mistakes_made:
        delta_rating += 16

    try:
        db.add(create_solved_puzzle)
        db.flush()
        
        puzzle = db.query(Puzzle).filter(Puzzle.PuzzleId == solve_request.puzzle_id).first()

        for theme in puzzle.ThemeList:
            db.add(SolvedPuzzleTheme(solved_puzzle_id = create_solved_puzzle.id, theme = theme))

        user.puzzle_rating += delta_rating
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR ,detail="Database error.")
    
    return SolveResponse(
        new_rating=user.puzzle_rating
    )