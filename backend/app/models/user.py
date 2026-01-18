"""
User and Profile Database Models.
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """User account model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    provider = Column(String(50), default="local") # "local", "google", "github"
    provider_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to Profile
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base):
    """User profile model for degree planning."""
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Basic Info
    name = Column(String(255), nullable=True)
    university = Column(String(255), nullable=True)
    degree_major = Column(String(255), nullable=True)
    academic_year = Column(String(50), nullable=True)
    
    # Flexible JSON fields
    goals = Column(JSON, default=list)
    preferences = Column(JSON, default=dict)
    
    completed_onboarding = Column(Boolean, default=False)
    
    # Relationship back to User
    user = relationship("User", back_populates="profile")
