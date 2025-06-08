"""
관심종목 API 엔드포인트
"""

from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.logging_system import log_error, log_info
from app.services.supabase_service import supabase_service

router = APIRouter()

# ===========================================
# 요청/응답 모델
# ===========================================


class AddToWatchlistRequest(BaseModel):
    symbol: str
    name: str
    market: Optional[str] = None
    type: Optional[str] = "Stock"
    region: Optional[str] = "US"
    currency: Optional[str] = "USD"
    memo: Optional[str] = None


class RemoveFromWatchlistRequest(BaseModel):
    symbol: str


# ===========================================
# API 엔드포인트
# ===========================================


@router.get("/watchlist")
async def get_user_watchlist(user_id: UUID = Depends(get_current_user)) -> JSONResponse:
    """사용자 관심종목 목록 조회"""
    try:
        watchlist = await supabase_service.get_watchlist(user_id)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": watchlist,
                "count": len(watchlist),
                "message": "관심종목 목록 조회 완료",
            },
        )

    except Exception as e:
        log_error(f"관심종목 조회 API 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="관심종목 조회에 실패했습니다.",
        )


@router.post("/watchlist/add")
async def add_to_watchlist(
    request: AddToWatchlistRequest, user_id: UUID = Depends(get_current_user)
) -> JSONResponse:
    """관심종목 추가"""
    try:
        # 이미 관심종목에 있는지 확인
        is_already_added = await supabase_service.is_in_watchlist(
            user_id, request.symbol
        )

        if is_already_added:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "message": f"{request.symbol}은(는) 이미 관심종목에 등록되어 있습니다.",
                },
            )

        # 관심종목 추가
        success = await supabase_service.add_to_watchlist(
            user_id=user_id,
            symbol=request.symbol,
            name=request.name,
            market=request.market,
            type=request.type,
            region=request.region,
            currency=request.currency,
            memo=request.memo,
        )

        if success:
            log_info(f"관심종목 추가 성공: {user_id} -> {request.symbol}")
            return JSONResponse(
                status_code=201,
                content={
                    "success": True,
                    "message": f"{request.symbol} ({request.name})을(를) 관심종목에 추가했습니다.",
                },
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="관심종목 추가에 실패했습니다.",
            )

    except HTTPException:
        raise
    except Exception as e:
        log_error(f"관심종목 추가 API 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="관심종목 추가 중 오류가 발생했습니다.",
        )


@router.post("/watchlist/remove")
async def remove_from_watchlist(
    request: RemoveFromWatchlistRequest, user_id: UUID = Depends(get_current_user)
) -> JSONResponse:
    """관심종목 제거"""
    try:
        # 관심종목에 있는지 확인
        is_in_watchlist = await supabase_service.is_in_watchlist(
            user_id, request.symbol
        )

        if not is_in_watchlist:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "message": f"{request.symbol}은(는) 관심종목에 등록되어 있지 않습니다.",
                },
            )

        # 관심종목 제거
        success = await supabase_service.remove_from_watchlist(user_id, request.symbol)

        if success:
            log_info(f"관심종목 제거 성공: {user_id} -> {request.symbol}")
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"{request.symbol}을(를) 관심종목에서 제거했습니다.",
                },
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="관심종목 제거에 실패했습니다.",
            )

    except HTTPException:
        raise
    except Exception as e:
        log_error(f"관심종목 제거 API 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="관심종목 제거 중 오류가 발생했습니다.",
        )


@router.get("/watchlist/check/{symbol}")
async def check_watchlist_status(
    symbol: str, user_id: UUID = Depends(get_current_user)
) -> JSONResponse:
    """특정 종목의 관심종목 등록 여부 확인"""
    try:
        is_in_watchlist = await supabase_service.is_in_watchlist(user_id, symbol)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": {"symbol": symbol, "is_in_watchlist": is_in_watchlist},
                "message": "관심종목 상태 확인 완료",
            },
        )

    except Exception as e:
        log_error(f"관심종목 상태 확인 API 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="관심종목 상태 확인에 실패했습니다.",
        )
