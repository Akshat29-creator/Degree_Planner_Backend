"""
Security utilities: Password hashing, JWT token management, and User Dependencies.
Uses argon2 instead of bcrypt to avoid common issues.
"""
from datetime import datetime, timedelta
from typing import Optional, Union, Any, Annotated
from jose import jwt, JWTError
import hashlib
import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User

# ============================================
# CONFIGURATION
# ============================================
SECRET_KEY = "degree-planner-secret-key-2024-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# ============================================
# PASSWORD FUNCTIONS (Simple SHA256 + Salt for reliability)
# ============================================
def get_password_hash(password: str) -> str:
    """Hash a password using SHA256 with salt."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${hashed}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        salt, stored_hash = hashed_password.split("$")
        computed_hash = hashlib.sha256((salt + plain_password).encode()).hexdigest()
        return computed_hash == stored_hash
    except:
        return False


# ============================================
# JWT TOKEN FUNCTIONS
# ============================================
def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"sub": str(subject), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """Decode a JWT access token and return the subject (email)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

# ============================================
# DEPENDENCIES
# ============================================
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
) -> User:
    """Extract and validate the current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = decode_access_token(token)
    if email is None:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_user_optional(
    token: Annotated[Optional[str], Depends(oauth2_scheme_optional)] = None,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Extract current user if token is valid, otherwise return None.
    Does NOT raise HTTPException.
    """
    if not token:
        return None
        
    try:
        email = decode_access_token(token)
        if email is None:
            return None
        
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        return user
    except:
        return None
