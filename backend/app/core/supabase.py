"""Supabase 클라이언트 설정 및 인증 유틸리티."""

import os
from typing import Any, Dict, Optional

import jwt
from fastapi import HTTPException, status
from pydantic import BaseModel
from supabase import Client, create_client


class SupabaseConfig(BaseModel):
    """Supabase 설정 모델."""

    url: str
    service_role_key: str
    anon_key: str
    jwt_secret: str


class SupabaseClient:
    """Supabase 클라이언트 래퍼 클래스."""

    def __init__(self):
        """Supabase 클라이언트 초기화."""
        self.config = self._load_config()
        self.client: Client = create_client(
            self.config.url, self.config.service_role_key
        )

    def _load_config(self) -> SupabaseConfig:
        """환경변수에서 Supabase 설정 로드."""
        return SupabaseConfig(
            url=os.getenv("SUPABASE_URL", ""),
            service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
            anon_key=os.getenv("SUPABASE_ANON_KEY", ""),
            jwt_secret=os.getenv("SUPABASE_JWT_SECRET", ""),
        )

    def verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """JWT 토큰 검증."""
        try:
            # JWT 토큰 디코딩 및 검증
            payload = jwt.decode(
                token,
                self.config.jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="토큰이 만료되었습니다.",
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="유효하지 않은 토큰입니다.",
            )

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """사용자 ID로 사용자 정보 조회."""
        try:
            response = self.client.auth.admin.get_user_by_id(user_id)
            return response.user.dict() if response.user else None
        except Exception as e:
            print(f"사용자 조회 오류: {e}")
            return None

    def create_user(self, email: str, password: str, **kwargs) -> Dict[str, Any]:
        """새 사용자 생성."""
        try:
            user_data = {
                "email": email,
                "password": password,
                "email_confirm": True,
                **kwargs,
            }
            response = self.client.auth.admin.create_user(user_data)
            return response.user.dict() if response.user else {}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"사용자 생성 실패: {str(e)}",
            )


# 전역 Supabase 클라이언트 인스턴스
supabase_client = SupabaseClient()


def get_supabase_client() -> SupabaseClient:
    """Supabase 클라이언트 인스턴스 반환."""
    return supabase_client
