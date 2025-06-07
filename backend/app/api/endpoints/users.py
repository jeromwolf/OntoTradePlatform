"""
사용자 관리 API 엔드포인트

사용자 프로필 관리, 통계 조회, 리더보드, 계정 관리 등의 기능을 제공하는 FastAPI 라우터입니다.
중앙 집중식 로깅, 에러 처리, 성능 모니터링이 통합되어 있습니다.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.logging_system import (
    log_info, log_warning, log_error, log_critical, log_api_call,
    ErrorCategory, ErrorSeverity, logging_system
)
from app.core.monitoring import capture_exception, capture_message

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
    log_api_call(endpoint="GET /users/profile", parameters={})
    
    try:
        with logging_system.performance_monitor.measure_operation("user_profile") as monitor:
            log_info("사용자 프로필 조회 시작", category="user", context={
                "source": "user_endpoint"
            })
            
            # TODO: JWT에서 사용자 ID 추출 후 실제 데이터 조회
            profile = UserProfile(
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
            
            log_info("사용자 프로필 조회 성공", category="user", context={
                "user_id": profile.id,
                "username": profile.username,
                "level": profile.level,
                "virtual_balance": profile.virtual_balance
            })
            
            return profile
            
    except Exception as e:
        log_error("사용자 프로필 조회 실패", 
                 category=ErrorCategory.BUSINESS_LOGIC.value, 
                 severity=ErrorSeverity.HIGH.value,
                 context={
                     "error": str(e),
                     "error_type": type(e).__name__
                 })
        
        capture_exception(e, {
            "endpoint": "GET /users/profile",
            "operation": "get_user_profile"
        })
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="프로필 조회 중 오류가 발생했습니다."
        )


@router.put("/profile")
async def update_user_profile(profile_data: UpdateProfile):
    """사용자 프로필 업데이트"""
    log_api_call(endpoint="PUT /users/profile", parameters={
        "fields_to_update": list(profile_data.dict(exclude_unset=True).keys())
    })
    
    try:
        with logging_system.performance_monitor.measure_operation("update_profile") as monitor:
            log_info("사용자 프로필 업데이트 시작", category="user", context={
                "fields_to_update": list(profile_data.dict(exclude_unset=True).keys()),
                "source": "user_endpoint"
            })
            
            # 업데이트할 필드 검증
            update_fields = profile_data.dict(exclude_unset=True)
            if not update_fields:
                log_warning("업데이트할 필드가 없음", 
                           category=ErrorCategory.VALIDATION.value, 
                           severity=ErrorSeverity.MEDIUM.value,
                           context={
                               "error": "no_fields_to_update"
                           })
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="업데이트할 필드를 제공해주세요."
                )
            
            # TODO: 실제 데이터베이스 업데이트 로직
            response_data = {
                "message": "프로필이 성공적으로 업데이트되었습니다.",
                "updated_fields": update_fields,
                "updated_at": datetime.utcnow().isoformat(),
            }
            
            log_info("사용자 프로필 업데이트 성공", category="user", context={
                "updated_fields": list(update_fields.keys()),
                "field_count": len(update_fields)
            })
            
            return JSONResponse(response_data)
            
    except HTTPException:
        # 이미 처리된 HTTPException은 그대로 재발생
        raise
    except Exception as e:
        log_error("사용자 프로필 업데이트 실패", 
                 category=ErrorCategory.BUSINESS_LOGIC.value, 
                 severity=ErrorSeverity.HIGH.value,
                 context={
                     "fields_to_update": list(profile_data.dict(exclude_unset=True).keys()),
                     "error": str(e),
                     "error_type": type(e).__name__
                 })
        
        capture_exception(e, {
            "endpoint": "PUT /users/profile",
            "profile_data": profile_data.dict(exclude_unset=True),
            "operation": "update_user_profile"
        })
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="프로필 업데이트 중 오류가 발생했습니다."
        )


@router.get("/stats")
async def get_user_stats():
    """사용자 통계 정보 조회"""
    log_api_call(endpoint="GET /users/stats", parameters={})
    
    try:
        with logging_system.performance_monitor.measure_operation("user_stats") as monitor:
            log_info("사용자 통계 조회 시작", category="user", context={
                "source": "user_endpoint"
            })
            
            # TODO: 실제 통계 계산 로직
            stats_data = {
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
            
            log_info("사용자 통계 조회 성공", category="user", context={
                "total_trades": stats_data["total_trades"],
                "total_return": stats_data["total_return"],
                "current_rank": stats_data["rank"]["current_rank"],
                "achievements_count": len(stats_data["achievements"])
            })
            
            return JSONResponse(stats_data)
            
    except Exception as e:
        log_error("사용자 통계 조회 실패", 
                 category=ErrorCategory.BUSINESS_LOGIC.value, 
                 severity=ErrorSeverity.HIGH.value,
                 context={
                     "error": str(e),
                     "error_type": type(e).__name__
                 })
        
        capture_exception(e, {
            "endpoint": "GET /users/stats",
            "operation": "get_user_stats"
        })
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="사용자 통계 조회 중 오류가 발생했습니다."
        )


@router.get("/leaderboard")
async def get_leaderboard(limit: Optional[int] = 10):
    """리더보드 조회"""
    log_api_call(endpoint="GET /users/leaderboard", parameters={"limit": limit})
    
    try:
        with logging_system.performance_monitor.measure_operation("leaderboard") as monitor:
            log_info("리더보드 조회 시작", category="user", context={
                "limit": limit,
                "source": "user_endpoint"
            })
            
            # 리미트 검증
            if limit is not None and (limit < 1 or limit > 100):
                log_warning("잘못된 리더보드 조회 제한", 
                           category=ErrorCategory.VALIDATION.value, 
                           severity=ErrorSeverity.MEDIUM.value,
                           context={
                               "limit": limit,
                               "error": "invalid_limit_range"
                           })
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="제한값은 1과 100 사이의 값이어야 합니다."
                )
            
            # TODO: 실제 리더보드 데이터 조회
            leaderboard_data = {
                "leaderboard": [
                    {
                        "rank": 1,
                        "username": "TradeKing",
                        "total_return": 45.2,
                        "portfolio_value": 145200.0,
                        "level": 5,
                        "avatar": "https://example.com/avatar1.jpg",
                    },
                    {
                        "rank": 2,
                        "username": "StockMaster",
                        "total_return": 38.7,
                        "portfolio_value": 138700.0,
                        "level": 4,
                        "avatar": None,
                    },
                    {
                        "rank": 3,
                        "username": "InvestPro",
                        "total_return": 32.1,
                        "portfolio_value": 132100.0,
                        "level": 3,
                        "avatar": "https://example.com/avatar3.jpg",
                    },
                ],
                "total_users": 1000,
                "last_updated": datetime.utcnow().isoformat(),
            }
            
            # 요청된 제한값에 따라 데이터 조정
            if limit is not None:
                leaderboard_data["leaderboard"] = leaderboard_data["leaderboard"][:limit]
            
            log_info("리더보드 조회 성공", category="user", context={
                "returned_users_count": len(leaderboard_data["leaderboard"]),
                "total_users": leaderboard_data["total_users"],
                "requested_limit": limit
            })
            
            return JSONResponse(leaderboard_data)
            
    except HTTPException:
        # 이미 처리된 HTTPException은 그대로 재발생
        raise
    except Exception as e:
        log_error("리더보드 조회 실패", 
                 category=ErrorCategory.BUSINESS_LOGIC.value, 
                 severity=ErrorSeverity.HIGH.value,
                 context={
                     "limit": limit,
                     "error": str(e),
                     "error_type": type(e).__name__
                 })
        
        capture_exception(e, {
            "endpoint": "GET /users/leaderboard",
            "parameters": {"limit": limit},
            "operation": "get_leaderboard"
        })
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="리더보드 조회 중 오류가 발생했습니다."
        )


@router.delete("/account")
async def delete_user_account():
    """사용자 계정 삭제"""
    log_api_call(endpoint="DELETE /users/account", parameters={})
    
    try:
        with logging_system.performance_monitor.measure_operation("delete_account") as monitor:
            log_info("사용자 계정 삭제 요청 시작", category="user", context={
                "source": "user_endpoint"
            })
            
            # TODO: JWT에서 사용자 ID 추출
            user_id = "user_123"  # 임시값
            
            # TODO: 계정 삭제 전 검증 로직
            # - 진행 중인 거래가 있는지 확인
            # - 미결제 잔액이 있는지 확인
            # - 기타 제약 조건 확인
            
            log_warning("사용자 계정 삭제 실행", 
                       category=ErrorCategory.BUSINESS_LOGIC.value, 
                       severity=ErrorSeverity.HIGH.value,
                       context={
                           "user_id": user_id,
                           "action": "account_deletion",
                           "note": "irreversible_action"
                       })
            
            # TODO: 실제 계정 삭제 로직
            # - 사용자 데이터 삭제
            # - 포트폴리오 데이터 삭제
            # - 거래 내역 익명화
            # - 관련 세션 무효화
            
            response_data = {
                "message": "계정이 성공적으로 삭제되었습니다.",
                "deleted_at": datetime.utcnow().isoformat(),
                "user_id": user_id,
            }
            
            log_critical("사용자 계정 삭제 완료", category="user", context={
                "user_id": user_id,
                "deleted_at": response_data["deleted_at"],
                "action": "account_deleted"
            })
            
            return JSONResponse(response_data)
            
    except Exception as e:
        log_error("사용자 계정 삭제 실패", 
                 category=ErrorCategory.BUSINESS_LOGIC.value, 
                 severity=ErrorSeverity.CRITICAL.value,
                 context={
                     "error": str(e),
                     "error_type": type(e).__name__,
                     "action": "account_deletion_failed"
                 })
        
        capture_exception(e, {
            "endpoint": "DELETE /users/account",
            "operation": "delete_user_account"
        })
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="계정 삭제 중 오류가 발생했습니다."
        )
