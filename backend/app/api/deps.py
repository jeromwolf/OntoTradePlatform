"""의존성 주입을 위한 유틸리티 함수들"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.schemas.user import User, UserInDB
from app.services.supabase_service import supabase_service

# OAuth2 스키마 설정
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    """JWT 토큰에서 현재 사용자 정보를 가져옵니다."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # JWT 토큰 검증
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Supabase에서 사용자 정보 조회
    user_data = (
        supabase_service.supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not user_data.data:
        raise credentials_exception

    return UserInDB(**user_data.data)


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """현재 활성 사용자를 반환합니다."""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# 관리자 권한 확인
def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """관리자 권한이 있는지 확인합니다."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="관리자 권한이 필요합니다."
        )
    return current_user


# KIS API 클라이언트 의존성
async def get_kis_client():
    """KIS API 클라이언트 인스턴스를 반환합니다."""
    from app.services.kis_client import KISClient

    return KISClient()
