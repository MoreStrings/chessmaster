from fastapi import FastAPI, HTTPException, Depends
from ai import router as ai_router
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Annotated
from database import SessionLocal, Puzzle, User, init_db
from pydantic import BaseModel
from starlette import status
import random
import json
import auth
import puzzle
from auth import get_current_user

app = FastAPI()
app.include_router(auth.router)
app.include_router(puzzle.router)
app.include_router(ai_router)
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")
    return {"User": user}
