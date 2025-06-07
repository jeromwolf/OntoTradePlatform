from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()


# 기본 스키마
class Stock(BaseModel):
    symbol: str
    name: str
    name_ko: Optional[str] = None
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    sector: Optional[str] = None
    currency: str = "USD"


class StockSearch(BaseModel):
    symbol: str
    name: str
    name_ko: Optional[str] = None
    exchange: str
    currency: str


@router.get("/search")
async def search_stocks(
    q: str = Query(..., description="검색 키워드 (종목명 또는 심볼)"),
    limit: int = Query(10, description="결과 개수 제한"),
):
    """주식 검색"""
    # TODO: 실제 주식 데이터 API 연동
    mock_results = [
        StockSearch(
            symbol="AAPL",
            name="Apple Inc.",
            name_ko="애플",
            exchange="NASDAQ",
            currency="USD",
        ),
        StockSearch(
            symbol="GOOGL",
            name="Alphabet Inc.",
            name_ko="알파벳",
            exchange="NASDAQ",
            currency="USD",
        ),
        StockSearch(
            symbol="TSLA",
            name="Tesla, Inc.",
            name_ko="테슬라",
            exchange="NASDAQ",
            currency="USD",
        ),
    ]

    # 검색어 필터링 (실제로는 외부 API 호출)
    filtered_results = [
        stock
        for stock in mock_results
        if q.lower() in stock.symbol.lower()
        or q.lower() in stock.name.lower()
        or (stock.name_ko and q.lower() in stock.name_ko.lower())
    ]

    return JSONResponse(
        {
            "results": [stock.dict() for stock in filtered_results[:limit]],
            "total": len(filtered_results),
            "query": q,
        }
    )


@router.get("/trending")
async def get_trending_stocks():
    """인기 종목 조회"""
    # TODO: 실제 인기 종목 데이터
    trending_stocks = [
        Stock(
            symbol="AAPL",
            name="Apple Inc.",
            name_ko="애플",
            price=175.84,
            change=2.14,
            change_percent=1.23,
            volume=54789123,
            market_cap=2850000000000,
            sector="Technology",
            currency="USD",
        ),
        Stock(
            symbol="NVDA",
            name="NVIDIA Corporation",
            name_ko="엔비디아",
            price=432.65,
            change=-5.23,
            change_percent=-1.19,
            volume=23456789,
            market_cap=1250000000000,
            sector="Technology",
            currency="USD",
        ),
        Stock(
            symbol="TSLA",
            name="Tesla, Inc.",
            name_ko="테슬라",
            price=198.45,
            change=8.76,
            change_percent=4.62,
            volume=67891234,
            market_cap=625000000000,
            sector="Automotive",
            currency="USD",
        ),
    ]

    return JSONResponse(
        {
            "trending_stocks": [stock.dict() for stock in trending_stocks],
            "updated_at": datetime.utcnow().isoformat(),
        }
    )


@router.get("/{symbol}")
async def get_stock_detail(symbol: str):
    """개별 종목 상세 정보"""
    # TODO: 실제 종목 데이터 API 연동
    if symbol.upper() == "AAPL":
        stock_detail = {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "name_ko": "애플",
            "price": 175.84,
            "change": 2.14,
            "change_percent": 1.23,
            "volume": 54789123,
            "market_cap": 2850000000000,
            "sector": "Technology",
            "currency": "USD",
            "exchange": "NASDAQ",
            "previous_close": 173.70,
            "open": 174.20,
            "day_high": 176.95,
            "day_low": 173.85,
            "week_52_high": 199.62,
            "week_52_low": 164.08,
            "pe_ratio": 28.45,
            "dividend_yield": 0.52,
            "beta": 1.24,
            "eps": 6.18,
            "description": "Apple Inc.는 소비자 전자제품, 컴퓨터 소프트웨어 및 온라인 서비스를 설계, 제조 및 판매하는 미국 다국적 기술 회사입니다.",
        }
        return JSONResponse(stock_detail)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"종목 '{symbol}'을 찾을 수 없습니다.",
    )


@router.get("/{symbol}/history")
async def get_stock_history(
    symbol: str,
    period: str = Query("1M", description="기간 (1D, 1W, 1M, 3M, 6M, 1Y)"),
    interval: str = Query("1D", description="간격 (1M, 5M, 15M, 1H, 1D)"),
):
    """주식 가격 히스토리"""
    # TODO: 실제 히스토리 데이터 API 연동
    mock_history = {
        "symbol": symbol.upper(),
        "period": period,
        "interval": interval,
        "data": [
            {
                "timestamp": "2024-06-01T09:30:00Z",
                "open": 170.50,
                "high": 172.80,
                "low": 169.95,
                "close": 171.45,
                "volume": 45123456,
            },
            {
                "timestamp": "2024-06-02T09:30:00Z",
                "open": 171.45,
                "high": 174.20,
                "low": 170.85,
                "close": 173.70,
                "volume": 52987654,
            },
            {
                "timestamp": "2024-06-03T09:30:00Z",
                "open": 173.70,
                "high": 176.95,
                "low": 173.85,
                "close": 175.84,
                "volume": 54789123,
            },
        ],
    }

    return JSONResponse(mock_history)
