from datetime import datetime, UTC, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import SessionLocal, User
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

SECRET_KEY = "123456789ABCDEFEDCBA987654321"
ALGORITHM = "HS256"

bcrypt_context = CryptContext(schemes=["argon2","bcrypt"], default="argon2",deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    elo: int

class Token(BaseModel):
    access_token: str
    token_type: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    
    existing_user = db.query(User).filter(
        (User.username == create_user_request.username) |
        (User.email == create_user_request.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or Email already in use."
        )

    create_user_model = User(
        username = create_user_request.username,
        email = create_user_request.email,
        password_hash = bcrypt_context.hash(create_user_request.password),
        puzzle_rating = create_user_request.elo,
        created_at  = datetime.now(UTC),
    )

    try:
        db.add(create_user_model)
        db.commit()
        db.refresh(create_user_model)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user due to database constraint."
        )

    return{"message": "User created succesfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):

    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not bcrypt_context.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user.")

    token = create_access_token(user.username, user.id, timedelta(days=7))

    return {"access_token": token, "token_type": "bearer"}


def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {"sub": username, "id": user_id}
    expires = datetime.now(UTC) + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")

        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user.")
        
        return {"username": username, "id": user_id}
    
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user.")
    

@router.get("/me")
async def get_me(db: db_dependency, user: dict = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user["id"]).first()
    return {
        "user_id": user.id,
        "username": user.username,
        "elo": user.puzzle_rating,
        "total_puzzles": user.total_puzzles,
        "solved_puzzles": user.solved_puzzles,
        "total_ai_games": user.total_ai_games,
        "ai_games_won": user.ai_games_won,
    }
