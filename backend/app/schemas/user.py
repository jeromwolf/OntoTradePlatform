"""사용자 관련 Pydantic 모델"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: bool = True
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
