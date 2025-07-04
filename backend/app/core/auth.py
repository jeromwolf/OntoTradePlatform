"""인증 미들웨어 및 유틸리티."""

import logging
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .supabase import SupabaseClient, get_supabase_client

# Bearer 토큰 보안 스킴
security = HTTPBearer()

logger = logging.getLogger(__name__)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase_client: SupabaseClient = Depends(get_supabase_client),
) -> Dict[str, Any]:
    """
    현재 인증된 사용자 정보를 반환합니다.

    Args:
        credentials: HTTP Authorization 헤더의 Bearer 토큰
        supabase_client: Supabase 클라이언트 인스턴스

    Returns:
        Dict[str, Any]: 사용자 정보

    Raises:
        HTTPException: 인증 실패 시
    """
    logger.info(
        f"인증 시도: 토큰 길이={len(credentials.credentials) if credentials.credentials else 0}"
    )

    try:
        # JWT 토큰에서 사용자 정보 추출
        token_payload = supabase_client.verify_jwt_token(credentials.credentials)
        logger.info(f"토큰 페이로드: {token_payload}")

        # 사용자 ID 추출
        user_id = token_payload.get("sub")
        if not user_id:
            logger.error("토큰에서 사용자 ID를 찾을 수 없음")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="토큰에서 사용자 ID를 찾을 수 없습니다.",
            )

        # Supabase에서 사용자 정보 조회
        user = supabase_client.get_user_by_id(user_id)
        if not user:
            logger.error(f"사용자 ID {user_id}를 찾을 수 없음")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="사용자를 찾을 수 없습니다.",
            )

        logger.info(f"인증 성공: 사용자 ID={user_id}")
        return user

    except Exception as e:
        logger.error(f"인증 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰입니다.",
        )


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase_client: SupabaseClient = Depends(get_supabase_client),
) -> str:
    """
    현재 인증된 사용자의 ID만 반환합니다.

    Args:
        credentials: HTTP Authorization 헤더의 Bearer 토큰
        supabase_client: Supabase 클라이언트 인스턴스

    Returns:
        str: 사용자 ID

    Raises:
        HTTPException: 인증 실패 시
    """
    # JWT 토큰에서 사용자 정보 추출
    token_payload = supabase_client.verify_jwt_token(credentials.credentials)

    # 사용자 ID 추출
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰에서 사용자 ID를 찾을 수 없습니다.",
        )

    return user_id


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase_client: SupabaseClient = Depends(get_supabase_client),
) -> Optional[Dict[str, Any]]:
    """
    선택적으로 현재 사용자 정보를 반환합니다 (토큰이 없어도 됨).

    Args:
        credentials: HTTP Authorization 헤더의 Bearer 토큰 (선택적)
        supabase_client: Supabase 클라이언트 인스턴스

    Returns:
        Optional[Dict[str, Any]]: 사용자 정보 또는 None
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials, supabase_client)
    except HTTPException:
        return None
