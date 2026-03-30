from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal, SolvedPuzzleTheme, SolvedPuzzles
from auth import get_current_user, db_dependency, User

router = APIRouter(prefix="/puzzles", tags=["Puzzle Analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get solved puzzle themes for the current user
@router.get("/solved-themes")
def get_solved_themes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = (
        db.query(
            SolvedPuzzleTheme.theme,
            func.count(SolvedPuzzleTheme.theme).label("count")
        )
        .join(SolvedPuzzles, SolvedPuzzleTheme.solved_puzzle_id == SolvedPuzzles.id)
        .filter(SolvedPuzzles.user_id == current_user.id)
        .group_by(SolvedPuzzleTheme.theme)
        .order_by(func.count(SolvedPuzzleTheme.theme).desc())
        .all()
    )

    return [{"theme": r.theme, "count": r.count} for r in results]
