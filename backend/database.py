from sqlalchemy import Column, String, Integer, JSON, DateTime, Boolean, ForeignKey, UniqueConstraint, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, UTC

DATABASE_URL = "sqlite:///./puzzles.db"

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    puzzle_rating = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.now(UTC))


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


def init_db():
    Base.metadata.create_all(bind=engine)