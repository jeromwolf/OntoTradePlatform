"""
종목 검색 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
import logging
from uuid import UUID

from app.core.auth import get_current_user
from app.services.stock_search import stock_search_service, StockSearchResult
from app.core.logging_system import LoggingSystem

router = APIRouter()
logging_system = LoggingSystem()
logger = logging.getLogger(__name__)

@router.get("/search", response_model=List[dict])
async def search_stocks(
    q: str = Query(..., description="검색어 (종목명 또는 심볼)", min_length=1),
    market: str = Query("all", description="시장 (all, us, kr)"),
    limit: int = Query(50, description="결과 개수 제한", ge=1, le=100),
    user_id: UUID = Depends(get_current_user)
):
    """
    종목 검색
    
    - **q**: 검색어 (종목명 또는 심볼)
    - **market**: 시장 선택 (all, us, kr)  
    - **limit**: 최대 결과 개수
    """
    try:
        async with logging_system.performance_monitor("stock_search"):
            async with stock_search_service as search_service:
                results = await search_service.search_stocks(
                    query=q,
                    market=market,
                    limit=limit
                )
        
        # 응답 형태로 변환
        response_data = []
        for result in results:
            response_data.append({
                "symbol": result.symbol,
                "name": result.name,
                "market": result.market,
                "type": result.type,
                "region": result.region,
                "currency": result.currency
            })
        
        logger.info(f"종목 검색 완료: '{q}' -> {len(response_data)}개 결과")
        
        return response_data
        
    except Exception as e:
        logger.error(f"종목 검색 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail="종목 검색 중 오류가 발생했습니다."
        )

@router.get("/suggest")
async def suggest_stocks(
    q: str = Query(..., description="검색어", min_length=1),
    limit: int = Query(10, description="결과 개수", ge=1, le=20),
    user_id: UUID = Depends(get_current_user)
):
    """
    종목 자동완성 제안
    빠른 응답을 위한 간단한 검색
    """
    try:
        async with stock_search_service as search_service:
            # 빠른 응답을 위해 제한된 검색
            results = await search_service.search_stocks(
                query=q,
                market="all",
                limit=limit
            )
        
        # 간단한 형태로 응답
        suggestions = []
        for result in results:
            suggestions.append({
                "symbol": result.symbol,
                "name": result.name,
                "display": f"{result.symbol} - {result.name}"
            })
        
        return {
            "query": q,
            "suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"종목 자동완성 오류: {e}")
        return {
            "query": q,
            "suggestions": []
        }

@router.get("/popular")
async def get_popular_stocks(
    market: str = Query("all", description="시장 (all, us, kr)"),
    limit: int = Query(20, description="결과 개수", ge=1, le=50),
    user_id: UUID = Depends(get_current_user)
):
    """
    인기 종목 목록 (하드코딩된 리스트)
    향후 실제 거래량/관심도 데이터로 대체 예정
    """
    try:
        # 인기 종목 하드코딩 리스트
        popular_stocks = {
            "us": [
                {"symbol": "AAPL", "name": "Apple Inc."},
                {"symbol": "MSFT", "name": "Microsoft Corporation"},
                {"symbol": "GOOGL", "name": "Alphabet Inc."},
                {"symbol": "AMZN", "name": "Amazon.com Inc."},
                {"symbol": "TSLA", "name": "Tesla Inc."},
                {"symbol": "NVDA", "name": "NVIDIA Corporation"},
                {"symbol": "META", "name": "Meta Platforms Inc."},
                {"symbol": "NFLX", "name": "Netflix Inc."},
                {"symbol": "ADBE", "name": "Adobe Inc."},
                {"symbol": "CRM", "name": "Salesforce Inc."}
            ],
            "kr": [
                {"symbol": "005930.KS", "name": "삼성전자"},
                {"symbol": "000660.KS", "name": "SK하이닉스"},
                {"symbol": "035420.KS", "name": "NAVER"},
                {"symbol": "051910.KS", "name": "LG화학"},
                {"symbol": "006400.KS", "name": "삼성SDI"},
                {"symbol": "035720.KS", "name": "카카오"},
                {"symbol": "068270.KS", "name": "셀트리온"},
                {"symbol": "207940.KS", "name": "삼성바이오로직스"},
                {"symbol": "373220.KS", "name": "LG에너지솔루션"},
                {"symbol": "096770.KS", "name": "SK이노베이션"}
            ]
        }
        
        if market == "us":
            stocks = popular_stocks["us"]
        elif market == "kr":
            stocks = popular_stocks["kr"]
        else:  # all
            stocks = popular_stocks["us"] + popular_stocks["kr"]
        
        return {
            "market": market,
            "stocks": stocks[:limit]
        }
        
    except Exception as e:
        logger.error(f"인기 종목 조회 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail="인기 종목 조회 중 오류가 발생했습니다."
        )
