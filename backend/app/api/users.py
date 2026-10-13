from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin, TokenResponse
from app.services.user_service import create_user, get_user_by_email, authenticate_user
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_route(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(db, user_data.email)


    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    return create_user(db, user_data)

@router.post("/login", response_model=TokenResponse)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        login_data.email,
        login_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user