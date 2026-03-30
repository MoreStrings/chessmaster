from sqlalchemy import Column, String, Integer, JSON, DateTime, Boolean, ForeignKey, UniqueConstraint, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, UTC
import os
from dotenv import load_dotenv

load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    puzzle_rating = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.now(UTC))

 
    total_puzzles = Column(Integer, default=0)
    solved_puzzles = Column(Integer, default=0)
    total_ai_games = Column(Integer, default=0)
    ai_games_won = Column(Integer, default=0)



class Puzzle(Base):
    __tablename__ = "puzzles"

    PuzzleId = Column(String, primary_key=True, index=True)
    FEN = Column(String, nullable=False)
    Moves = Column(String, nullable=False)
    Rating = Column(Integer, nullable=False)
    ThemeList = Column(JSON, nullable=False)

class SolvedPuzzles(Base):
    __tablename__ = "solved_puzzle"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    puzzle_id = Column(String, ForeignKey("puzzles.PuzzleId"))
    solved_at = Column(DateTime, default=datetime.now(UTC))
    solve_time_seconds = Column(Integer, nullable=True)
    hint_used = Column(Boolean, default=False)
    mistakes_made = Column(Boolean, default=False)

    __table_args__ = (
        UniqueConstraint("user_id", "puzzle_id", name="uix_user_puzzle"),
    )

class SolvedPuzzleTheme(Base):
    __tablename__ = "solved_puzzle_theme"

    id = Column(Integer, primary_key=True)
    solved_puzzle_id = Column(Integer, ForeignKey("solved_puzzle.id"))
    theme = Column(String)


class PuzzleAttempt(Base):
    __tablename__ = "puzzle_attempt"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    puzzle_id = Column(String, ForeignKey("puzzles.PuzzleId"))
    started_at = Column(DateTime, default=datetime.now(UTC))
    finished_at = Column(DateTime, nullable=True)

    solved = Column(Boolean, default=False)
    solve_time_seconds = Column(Integer, nullable=True)
    hint_used = Column(Boolean, default=False)
    mistakes_made = Column(Boolean, default=False)


class PuzzleAttemptTheme(Base):
    __tablename__ = "puzzle_attempt_theme"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("puzzle_attempt.id"))
    theme = Column(String)


def init_db():
    Base.metadata.create_all(bind=engine)