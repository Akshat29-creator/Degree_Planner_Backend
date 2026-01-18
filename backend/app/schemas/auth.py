"""
Authentication Pydantic Schemas.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class TokenData(BaseModel):
    username: Optional[str] = None


class SocialLoginRequest(BaseModel):
    email: str
    name: Optional[str] = None
    provider: str  # "google", "github"
    provider_id: str


class Token(BaseModel):
    """JWT Token response schema."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Public user information."""
    id: int
    email: str
    
    class Config:
        from_attributes = True
