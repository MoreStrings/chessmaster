import pandas as pd
import json
from database import SessionLocal, Puzzle, init_db

init_db()
session = SessionLocal()

df = pd.read_csv("puzzles.csv")

puzzles = []

for _, row in df.iterrows():
    try:
        theme_list = json.loads(row["ThemeList"])
    except json.JSONDecodeError:
        theme_list = []

    puzzles.append(
        Puzzle(
            PuzzleId=row["PuzzleId"],
            FEN=row["FEN"],
            Moves=row["Moves"],
            Rating=int(row["Rating"]),
            ThemeList=theme_list
        )
    )

session.bulk_save_objects(puzzles)
session.commit()
session.close()

print("Imported puzzles successfully!")
