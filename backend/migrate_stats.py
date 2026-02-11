from sqlalchemy import create_engine, text

DATABASE_URL = "sqlite:///./puzzles.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN total_puzzles INTEGER DEFAULT 0"))
    conn.execute(text("ALTER TABLE users ADD COLUMN solved_puzzles INTEGER DEFAULT 0"))
    conn.execute(text("ALTER TABLE users ADD COLUMN total_ai_games INTEGER DEFAULT 0"))
    conn.execute(text("ALTER TABLE users ADD COLUMN ai_games_won INTEGER DEFAULT 0"))
    conn.commit()
