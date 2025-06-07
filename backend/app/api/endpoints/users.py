from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()


# 기본 스키마
class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    virtual_balance: float
    level: int
    experience: int
    avatar: Optional[str] = None
    created_at: str
    updated_at: str


class UpdateProfile(BaseModel):
    username: Optional[str] = None
    avatar: Optional[str] = None


@router.get("/profile", response_model=UserProfile)
async def get_user_profile():
    """사용자 프로필 조회"""
    # TODO: JWT에서 사용자 ID 추출 후 실제 데이터 조회
    return UserProfile(
        id="user_123",
        email="test@ontotrade.com",
        username="testuser",
        virtual_balance=100000.0,
        level=1,
        experience=0,
        avatar=None,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat(),
    )


@router.put("/profile")
async def update_user_profile(profile_data: UpdateProfile):
    """사용자 프로필 업데이트"""
    # TODO: 실제 데이터베이스 업데이트 로직
    return JSONResponse(
        {
            "message": "프로필이 성공적으로 업데이트되었습니다.",
            "updated_fields": profile_data.dict(exclude_unset=True),
            "updated_at": datetime.utcnow().isoformat(),
        }
    )


@router.get("/stats")
async def get_user_stats():
    """사용자 통계 정보 조회"""
    # TODO: 실제 통계 계산 로직
    return JSONResponse(
        {
            "total_trades": 25,
            "successful_trades": 18,
            "total_return": 12.5,  # 퍼센트
            "current_portfolio_value": 112500.0,
            "level": 1,
            "experience": 150,
            "experience_to_next_level": 350,
            "achievements": [
                {
                    "id": "first_trade",
                    "name": "첫 거래",
                    "earned_at": "2024-06-01T10:00:00Z",
                },
                {
                    "id": "profitable_week",
                    "name": "수익성 있는 주간",
                    "earned_at": "2024-06-05T15:30:00Z",
                },
            ],
            "rank": {
                "current_rank": 156,
                "total_users": 1000,
                "percentile": 84.4,
            },
        }
    )


@router.get("/leaderboard")
async def get_leaderboard():
    """리더보드 조회"""
    # TODO: 실제 리더보드 데이터 조회
    return JSONResponse(
        {
            "top_users": [
                {
                    "rank": 1,
                    "username": "investor_pro",
                    "total_return": 45.2,
                    "portfolio_value": 145200.0,
                    "level": 5,
                },
                {
                    "rank": 2,
                    "username": "stock_master",
                    "total_return": 38.7,
                    "portfolio_value": 138700.0,
                    "level": 4,
                },
                {
                    "rank": 3,
                    "username": "crypto_king",
                    "total_return": 32.1,
                    "portfolio_value": 132100.0,
                    "level": 4,
                },
            ],
            "user_rank": {
                "rank": 156,
                "username": "testuser",
                "total_return": 12.5,
                "portfolio_value": 112500.0,
                "level": 1,
            },
            "updated_at": datetime.utcnow().isoformat(),
        }
    )


@router.delete("/account")
async def delete_user_account():
    """사용자 계정 삭제"""
    # TODO: 계정 삭제 로직 (데이터 백업 및 GDPR 준수)
    return JSONResponse(
        {
            "message": "계정 삭제 요청이 접수되었습니다. 24시간 내에 처리됩니다.",
            "deletion_scheduled_at": datetime.utcnow().isoformat(),
        }
    )
