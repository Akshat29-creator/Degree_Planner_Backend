"""
Pydantic schemas for User Identity & Profile Intelligence.
"""
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    """
    Core user profile data.
    """
    user_id: Optional[str] = Field(None, description="Unique user identifier")
    name: Optional[str] = Field(None, description="User's preferred name")
    email: Optional[str] = Field(None, description="User's email address")
    university: Optional[str] = Field(None, description="University name")
    degree_major: Optional[str] = Field(None, description="Degree or Major")
    academic_year: Optional[str] = Field(None, description="Current academic year (e.g., Freshman, Junior)")
    goals: List[str] = Field(default_factory=list, description="Academic or career goals")
    preferences: Dict[str, str] = Field(default_factory=dict, description="Study preferences (e.g., 'morning person', 'visual learner')")
    completed_onboarding: bool = Field(False, description="Whether the initial onboarding is complete")

class ProfileRequest(BaseModel):
    """
    Request to the Profile Intelligence Agent.
    """
    message: Optional[str] = Field(None, description="User's chat message")
    history: List[Dict[str, str]] = Field(default_factory=list, description="Chat history")
    auth_action: Literal["signup", "signin"] = Field("signin", description="Authentication action: 'signup' for new users, 'signin' for returning")

class ProfileResponse(BaseModel):
    """
    Response from the Profile Intelligence Agent.
    """
    chat_response: str = Field(..., description="Conversational response to the user")
    suggested_updates: Optional[UserProfile] = Field(None, description="Key-value pairs to update in the profile based on the conversation")
    onboarding_complete: bool = Field(False, description="Whether the agent believes onboarding is now finished")
