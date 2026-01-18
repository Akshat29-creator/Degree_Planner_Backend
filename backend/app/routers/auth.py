"""
Authentication Router - Handles user registration, login, and current user info.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, Profile
from app.schemas.auth import UserCreate, Token, UserResponse, SocialLoginRequest
from app.utils.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    decode_access_token,
    get_current_user,
    oauth2_scheme
)
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ============================================
# DEPENDENCY: Get Current User
# ============================================
# Imported from app.utils.security to avoid circular dependencies



# ============================================
# ROUTES
# ============================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    Creates both User and an empty Profile.
    """
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create the user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(new_user)
    await db.flush()  # Get the user ID
    
    # Create empty profile for the user
    new_profile = Profile(user_id=new_user.id)
    db.add(new_profile)
    
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password.
    Returns a JWT access token.
    """
    # Find user by email (username field is used for email in OAuth2)
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(subject=user.email)
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/social-login", response_model=Token)
async def social_login(
    request: SocialLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Login or Register via Social Provider (Firebase).
    Finds userr by email, creates if not exists, returns App JWT.
    """
    # 1. Check if user exists by email
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalars().first()

    if existing_user:
        # Update provider info if missing (optional linking)
        if existing_user.provider == "local":
             existing_user.provider = request.provider
             existing_user.provider_id = request.provider_id
             await db.commit()
    else:
        # 2. Create new user
        # We don't have a password for social users
        new_user = User(
            email=request.email,
            hashed_password=None, # Nullable now
            provider=request.provider,
            provider_id=request.provider_id
        )
        db.add(new_user)
        await db.flush()

        # Create empty profile
        # Use provided name if available to prepopulate profile
        new_profile = Profile(
            user_id=new_user.id,
            name=request.name or "Student"
        )
        db.add(new_profile)
        await db.commit()
        await db.refresh(new_user)
        existing_user = new_user

    # 3. Issue App JWT
    access_token = create_access_token(subject=existing_user.email)
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Get the currently authenticated user's information.
    """
    return current_user
