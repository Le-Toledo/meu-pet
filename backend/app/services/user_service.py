from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


def create_user(db: Session, user_data: UserCreate):
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    user = get_user_by_email(db, email)

    if user is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user