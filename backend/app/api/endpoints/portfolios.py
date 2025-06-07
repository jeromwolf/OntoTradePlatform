from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()


# 기본 스키마
class PortfolioItem(BaseModel):
    symbol: str
    name: str
    name_ko: Optional[str] = None
    quantity: int
    avg_price: float
    current_price: float
    total_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float


class Portfolio(BaseModel):
    id: str
    name: str
    total_value: float
    cash_balance: float
    total_invested: float
    total_return: float
    total_return_percent: float
    positions: List[PortfolioItem]
    created_at: str
    updated_at: str


class TradeOrder(BaseModel):
    symbol: str
    order_type: str  # "buy" or "sell"
    quantity: int
    order_method: str = "market"  # "market" or "limit"
    limit_price: Optional[float] = None


@router.get("/")
async def get_portfolios():
    """사용자의 포트폴리오 목록 조회"""
    # TODO: 실제 데이터베이스에서 포트폴리오 조회
    mock_portfolios = [
        {
            "id": "portfolio_1",
            "name": "메인 포트폴리오",
            "total_value": 112500.0,
            "cash_balance": 25000.0,
            "total_invested": 87500.0,
            "total_return": 12500.0,
            "total_return_percent": 12.5,
            "positions_count": 5,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        {
            "id": "portfolio_2",
            "name": "테크 주식 포트폴리오",
            "total_value": 85300.0,
            "cash_balance": 15300.0,
            "total_invested": 70000.0,
            "total_return": 15300.0,
            "total_return_percent": 21.9,
            "positions_count": 3,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
    ]

    return JSONResponse(
        {"portfolios": mock_portfolios, "total_portfolios": len(mock_portfolios)}
    )


@router.get("/{portfolio_id}")
async def get_portfolio_detail(portfolio_id: str):
    """포트폴리오 상세 정보 조회"""
    # TODO: 실제 포트폴리오 데이터 조회
    if portfolio_id == "portfolio_1":
        portfolio = Portfolio(
            id="portfolio_1",
            name="메인 포트폴리오",
            total_value=112500.0,
            cash_balance=25000.0,
            total_invested=87500.0,
            total_return=12500.0,
            total_return_percent=12.5,
            positions=[
                PortfolioItem(
                    symbol="AAPL",
                    name="Apple Inc.",
                    name_ko="애플",
                    quantity=50,
                    avg_price=165.20,
                    current_price=175.84,
                    total_value=8792.0,
                    unrealized_pnl=532.0,
                    unrealized_pnl_percent=6.4,
                ),
                PortfolioItem(
                    symbol="GOOGL",
                    name="Alphabet Inc.",
                    name_ko="알파벳",
                    quantity=20,
                    avg_price=145.50,
                    current_price=162.30,
                    total_value=3246.0,
                    unrealized_pnl=336.0,
                    unrealized_pnl_percent=11.5,
                ),
                PortfolioItem(
                    symbol="TSLA",
                    name="Tesla, Inc.",
                    name_ko="테슬라",
                    quantity=30,
                    avg_price=185.75,
                    current_price=198.45,
                    total_value=5953.5,
                    unrealized_pnl=381.0,
                    unrealized_pnl_percent=6.8,
                ),
            ],
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat(),
        )
        return JSONResponse(portfolio.dict())

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"포트폴리오 ID '{portfolio_id}'를 찾을 수 없습니다.",
    )


@router.post("/{portfolio_id}/orders")
async def place_order(portfolio_id: str, order: TradeOrder):
    """주문 실행"""
    # TODO: 실제 주문 실행 로직
    # 포트폴리오 존재 확인
    if portfolio_id not in ["portfolio_1", "portfolio_2"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"포트폴리오 ID '{portfolio_id}'를 찾을 수 없습니다.",
        )

    # 주문 유효성 검사
    if order.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="주문 수량은 0보다 커야 합니다.",
        )

    # 모의 주문 실행
    mock_order_response = {
        "order_id": f"order_{datetime.utcnow().timestamp()}",
        "portfolio_id": portfolio_id,
        "symbol": order.symbol,
        "order_type": order.order_type,
        "quantity": order.quantity,
        "order_method": order.order_method,
        "status": "executed",
        "executed_price": 175.84 if order.symbol == "AAPL" else 162.30,
        "executed_at": datetime.utcnow().isoformat(),
        "commission": 0.0,  # 수수료 없음 (시뮬레이션)
        "total_amount": (
            order.quantity * 175.84
            if order.symbol == "AAPL"
            else order.quantity * 162.30
        ),
    }

    return JSONResponse(mock_order_response, status_code=status.HTTP_201_CREATED)


@router.get("/{portfolio_id}/performance")
async def get_portfolio_performance(portfolio_id: str):
    """포트폴리오 성과 분석"""
    # TODO: 실제 성과 계산 로직
    performance_data = {
        "portfolio_id": portfolio_id,
        "performance_metrics": {
            "total_return": 12.5,
            "annualized_return": 15.2,
            "volatility": 18.7,
            "sharpe_ratio": 0.81,
            "max_drawdown": -8.3,
            "beta": 1.12,
            "alpha": 2.4,
        },
        "monthly_returns": [
            {"month": "2024-01", "return": 3.2},
            {"month": "2024-02", "return": -1.8},
            {"month": "2024-03", "return": 5.7},
            {"month": "2024-04", "return": 2.1},
            {"month": "2024-05", "return": 4.3},
            {"month": "2024-06", "return": 1.8},
        ],
        "sector_allocation": {
            "Technology": 65.2,
            "Healthcare": 15.3,
            "Financial": 10.8,
            "Consumer": 8.7,
        },
        "updated_at": datetime.utcnow().isoformat(),
    }

    return JSONResponse(performance_data)
