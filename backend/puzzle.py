import random
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from pydantic import BaseModel
from sqlalchemy import func, case
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import SessionLocal, User, Puzzle, SolvedPuzzles, SolvedPuzzleTheme, PuzzleAttempt, PuzzleAttemptTheme
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
    attemptId: int

class PuzzleRequest(BaseModel):
    user_id: int

class SolveRequest(BaseModel):
    user_id: int
    puzzle_id: str
    attempt_id: int
    solve_time_seconds: int
    hints_used: bool
    mistakes_made: bool

class SolveResponse(BaseModel):
    new_rating: int

class ThemeStat(BaseModel):
    theme: str
    solvedCount: int
    cleanSolvedCount: int
    struggleRate: float

class ThemeStatsResponse(BaseModel):
    themes: list[ThemeStat]

class SkipAttemptRequest(BaseModel):
    attempt_id: int

class ThemePerformanceRow(BaseModel):
    theme: str
    playedCount: int
    solvedCount: int
    unsolvedCount: int
    solvePercent: float

class ThemePerformanceResponse(BaseModel):
    themes: list[ThemePerformanceRow]


class SolveSummaryResponse(BaseModel):
    averageSolveTimeSeconds: int | None
    fastestSolveTimeSeconds: int | None
    highestRatedPuzzleSolved: dict | None


class HintMistakeSummaryResponse(BaseModel):
    totalSolved: int
    hintsUsed: int
    mistakesMade: int
    solvedCleanly: int
    hintOnly: int
    mistakeOnly: int
    bothHintAndMistake: int


class SolveTimeVsRatingPoint(BaseModel):
    rating: int
    solveTimeSeconds: int


class SolveTimeVsRatingResponse(BaseModel):
    points: list[SolveTimeVsRatingPoint]

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
            attempt = PuzzleAttempt(
                user_id=user.id,
                puzzle_id=puzzle.PuzzleId,
                started_at=datetime.now(UTC),
                solved=False,
            )
            db.add(attempt)
            db.flush()
            for theme in puzzle.ThemeList:
                db.add(PuzzleAttemptTheme(attempt_id=attempt.id, theme=theme))
            db.commit()

            return PuzzleResponse(
                PuzzleId=puzzle.PuzzleId,
                FEN=puzzle.FEN,
                Moves=puzzle.Moves,
                Rating=puzzle.Rating,
                attemptId=attempt.id,
            )
    
    #fallback
    puzzle = (
        db.query(Puzzle)
        .filter(~Puzzle.PuzzleId.in_(solved_subquery))
        .order_by(func.abs(Puzzle.Rating - user.puzzle_rating))
        .first()
    )

    attempt = PuzzleAttempt(
        user_id=user.id,
        puzzle_id=puzzle.PuzzleId,
        started_at=datetime.now(UTC),
        solved=False,
    )
    db.add(attempt)
    db.flush()
    for theme in puzzle.ThemeList:
        db.add(PuzzleAttemptTheme(attempt_id=attempt.id, theme=theme))
    db.commit()

    return PuzzleResponse(
        PuzzleId=puzzle.PuzzleId,
        FEN=puzzle.FEN,
        Moves=puzzle.Moves,
        Rating=puzzle.Rating,
        attemptId=attempt.id,
    )   
   

@router.post("/solve", response_model=SolveResponse)
def solve_puzzle(db: db_dependency, solve_request: SolveRequest):

    user = db.query(User).filter(User.id == solve_request.user_id).first()

    attempt = db.query(PuzzleAttempt).filter(PuzzleAttempt.id == solve_request.attempt_id).first()
    if not attempt or attempt.user_id != solve_request.user_id or attempt.puzzle_id != solve_request.puzzle_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid attempt")

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
        # Mark attempt solved
        attempt.solved = True
        attempt.finished_at = datetime.now(UTC)
        attempt.solve_time_seconds = solve_request.solve_time_seconds
        attempt.hint_used = solve_request.hints_used
        attempt.mistakes_made = solve_request.mistakes_made
        db.add(attempt)

        # Record the solved puzzle
        db.add(create_solved_puzzle)
        db.flush()
        
        puzzle = db.query(Puzzle).filter(Puzzle.PuzzleId == solve_request.puzzle_id).first()

        for theme in puzzle.ThemeList:
            db.add(SolvedPuzzleTheme(solved_puzzle_id = create_solved_puzzle.id, theme = theme))

        # Update puzzle rating
        user.puzzle_rating += delta_rating

        # --- NEW: Update puzzle stats ---
        user.total_puzzles += 1
        # Count as solved only if no mistakes and no hints
        if not solve_request.mistakes_made and not solve_request.hints_used:
            user.solved_puzzles += 1
        # --------------------------------

        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR ,detail="Database error.")
    
    return SolveResponse(
        new_rating=user.puzzle_rating
    )


@router.post("/skip")
def skip_attempt(db: db_dependency, user: user_dependency, body: SkipAttemptRequest):
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")

    attempt = db.query(PuzzleAttempt).filter(PuzzleAttempt.id == body.attempt_id).first()
    if not attempt or attempt.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    if attempt.finished_at is None:
        attempt.finished_at = datetime.now(UTC)
        attempt.solved = False
        db.add(attempt)
        db.commit()

    return {"ok": True}


@router.get("/theme-stats", response_model=ThemeStatsResponse)
def get_theme_stats(db: db_dependency, user: user_dependency):
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")

    total_count = func.count(SolvedPuzzleTheme.id)
    clean_count = func.sum(
        case(
            (
                (SolvedPuzzles.hint_used == False) & (SolvedPuzzles.mistakes_made == False),
                1,
            ),
            else_=0,
        )
    )

    rows = (
        db.query(
            SolvedPuzzleTheme.theme.label("theme"),
            total_count.label("solvedCount"),
            func.coalesce(clean_count, 0).label("cleanSolvedCount"),
        )
        .join(SolvedPuzzles, SolvedPuzzleTheme.solved_puzzle_id == SolvedPuzzles.id)
        .filter(SolvedPuzzles.user_id == user_id)
        .group_by(SolvedPuzzleTheme.theme)
        .order_by(total_count.desc())
        .all()
    )

    themes: list[ThemeStat] = []
    for r in rows:
        solved_count = int(r.solvedCount or 0)
        clean_solved_count = int(r.cleanSolvedCount or 0)
        struggle_rate = 0.0
        if solved_count > 0:
            struggle_rate = max(0.0, min(1.0, 1 - (clean_solved_count / solved_count)))

        themes.append(
            ThemeStat(
                theme=r.theme,
                solvedCount=solved_count,
                cleanSolvedCount=clean_solved_count,
                struggleRate=round(struggle_rate, 4),
            )
        )

    return ThemeStatsResponse(themes=themes)


@router.get("/theme-performance", response_model=ThemePerformanceResponse)
def get_theme_performance(db: db_dependency, user: user_dependency):
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")

    played_count = func.count(PuzzleAttemptTheme.id)
    solved_count = func.sum(case((PuzzleAttempt.solved == True, 1), else_=0))

    rows = (
        db.query(
            PuzzleAttemptTheme.theme.label("theme"),
            played_count.label("playedCount"),
            func.coalesce(solved_count, 0).label("solvedCount"),
        )
        .join(PuzzleAttempt, PuzzleAttemptTheme.attempt_id == PuzzleAttempt.id)
        .filter(PuzzleAttempt.user_id == user_id)
        .group_by(PuzzleAttemptTheme.theme)
        .order_by(played_count.desc())
        .all()
    )

    themes: list[ThemePerformanceRow] = []
    for r in rows:
        played = int(r.playedCount or 0)
        solved = int(r.solvedCount or 0)
        unsolved = max(0, played - solved)
        solve_percent = 0.0
        if played > 0:
            solve_percent = round((solved / played) * 100, 1)

        themes.append(
            ThemePerformanceRow(
                theme=r.theme,
                playedCount=played,
                solvedCount=solved,
                unsolvedCount=unsolved,
                solvePercent=solve_percent,
            )
        )

    return ThemePerformanceResponse(themes=themes)


@router.get("/solve-summary", response_model=SolveSummaryResponse)
def get_solve_summary(db: db_dependency, user: user_dependency):
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")

    avg_time = (
        db.query(func.avg(SolvedPuzzles.solve_time_seconds))
        .filter(
            SolvedPuzzles.user_id == user_id,
            SolvedPuzzles.solve_time_seconds.isnot(None),
        )
        .scalar()
    )
    fastest_time = (
        db.query(func.min(SolvedPuzzles.solve_time_seconds))
        .filter(
            SolvedPuzzles.user_id == user_id,
            SolvedPuzzles.solve_time_seconds.isnot(None),
        )
        .scalar()
    )

    highest = (
        db.query(SolvedPuzzles.puzzle_id, Puzzle.Rating)
        .join(Puzzle, SolvedPuzzles.puzzle_id == Puzzle.PuzzleId)
        .filter(SolvedPuzzles.user_id == user_id)
        .order_by(Puzzle.Rating.desc())
        .first()
    )

    return SolveSummaryResponse(
        averageSolveTimeSeconds=int(round(avg_time)) if avg_time is not None else None,
        fastestSolveTimeSeconds=int(fastest_time) if fastest_time is not None else None,
        highestRatedPuzzleSolved=(
            {"puzzleId": highest.puzzle_id, "rating": int(highest.Rating)}
            if highest is not None
            else None
        ),
    )


@router.get("/hint-mistake-summary", response_model=HintMistakeSummaryResponse)
def get_hint_mistake_summary(db: db_dependency, user: user_dependency):
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")

    row = (
        db.query(
            func.count(SolvedPuzzles.id).label("totalSolved"),
            func.coalesce(
                func.sum(case((SolvedPuzzles.hint_used == True, 1), else_=0)),
                0,
            ).label("hintsUsed"),
            func.coalesce(
                func.sum(case((SolvedPuzzles.mistakes_made == True, 1), else_=0)),
                0,
            ).label("mistakesMade"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            (SolvedPuzzles.hint_used == False)
                            & (SolvedPuzzles.mistakes_made == False),
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("solvedCleanly"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            (SolvedPuzzles.hint_used == True)
                            & (SolvedPuzzles.mistakes_made == False),
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("hintOnly"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            (SolvedPuzzles.hint_used == False)
                            & (SolvedPuzzles.mistakes_made == True),
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("mistakeOnly"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            (SolvedPuzzles.hint_used == True)
                            & (SolvedPuzzles.mistakes_made == True),
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("bothHintAndMistake"),
        )
        .filter(SolvedPuzzles.user_id == user_id)
        .one()
    )

    return HintMistakeSummaryResponse(
        totalSolved=int(row.totalSolved or 0),
        hintsUsed=int(row.hintsUsed or 0),
        mistakesMade=int(row.mistakesMade or 0),
        solvedCleanly=int(row.solvedCleanly or 0),
        hintOnly=int(row.hintOnly or 0),
        mistakeOnly=int(row.mistakeOnly or 0),
        bothHintAndMistake=int(row.bothHintAndMistake or 0),
    )


@router.get("/solve-time-vs-rating", response_model=SolveTimeVsRatingResponse)
def get_solve_time_vs_rating(db: db_dependency, user: user_dependency):
    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")

    rows = (
        db.query(Puzzle.Rating, SolvedPuzzles.solve_time_seconds)
        .join(Puzzle, SolvedPuzzles.puzzle_id == Puzzle.PuzzleId)
        .filter(
            SolvedPuzzles.user_id == user_id,
            SolvedPuzzles.solve_time_seconds.isnot(None),
        )
        .order_by(SolvedPuzzles.solved_at.asc())
        .all()
    )

    points: list[SolveTimeVsRatingPoint] = [
        SolveTimeVsRatingPoint(rating=int(r.Rating), solveTimeSeconds=int(r.solve_time_seconds))
        for r in rows
        if r.Rating is not None and r.solve_time_seconds is not None
    ]

    return SolveTimeVsRatingResponse(points=points)
