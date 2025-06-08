"""
포트폴리오 관리 API 엔드포인트

사용자의 포트폴리오 조회, 주문 실행, 성과 분석 등의 기능을 제공하는 FastAPI 라우터입니다.
중앙 집중식 로깅, 에러 처리, 성능 모니터링이 통합되어 있습니다.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.auth import get_current_user_id
from app.core.logging_system import (
    ErrorCategory,
    ErrorSeverity,
    log_api_call,
    log_critical,
    log_error,
    log_info,
    log_warning,
    logging_system,
)
from app.core.monitoring import capture_exception, capture_message
from app.models.portfolio import (
    HoldingCreate,
    Portfolio,
    PortfolioCreate,
    PortfolioDetail,
    PortfolioSummary,
    PortfolioUpdate,
    TransactionCreate,
)
from app.services.portfolio_service import PortfolioService

router = APIRouter()
portfolio_service = PortfolioService()


# 기본 스키마 (API 응답용)
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


class PortfolioResponse(BaseModel):
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
async def get_portfolios(current_user_id: UUID = Depends(get_current_user_id)):
    """사용자의 포트폴리오 목록 조회"""
    log_api_call(
        endpoint="GET /portfolios/", parameters={"user_id": str(current_user_id)}
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "portfolio_list"
        ) as monitor:
            log_info(
                "포트폴리오 목록 조회 시작",
                category="portfolio",
                context={
                    "source": "portfolio_endpoint",
                    "user_id": str(current_user_id),
                },
            )

            # 실제 데이터베이스에서 포트폴리오 조회
            portfolios = await portfolio_service.get_portfolios(current_user_id)

            response_data = {
                "portfolios": [
                    {
                        "id": str(portfolio.id),
                        "name": portfolio.name,
                        "description": portfolio.description,
                        "total_value": float(portfolio.total_value),
                        "current_balance": float(portfolio.current_balance),
                        "initial_balance": float(portfolio.initial_balance),
                        "risk_level": portfolio.risk_level,
                        "investment_goal": portfolio.investment_goal,
                        "target_return": (
                            float(portfolio.target_return)
                            if portfolio.target_return
                            else None
                        ),
                        "created_at": portfolio.created_at.isoformat(),
                        "updated_at": portfolio.updated_at.isoformat(),
                        "is_active": portfolio.is_active,
                    }
                    for portfolio in portfolios
                ],
                "total_portfolios": len(portfolios),
            }

            log_info(
                "포트폴리오 목록 조회 완료",
                category="portfolio",
                context={
                    "total_portfolios": len(portfolios),
                    "total_value": sum(float(p.total_value) for p in portfolios),
                },
            )

            return JSONResponse(response_data)

    except Exception as e:
        log_error(
            "포트폴리오 목록 조회 실패",
            category=ErrorCategory.BUSINESS_LOGIC.value,
            severity=ErrorSeverity.HIGH.value,
            context={
                "error": str(e),
                "error_type": type(e).__name__,
                "user_id": str(current_user_id),
            },
        )

        capture_exception(
            e,
            {
                "endpoint": "GET /portfolios/",
                "operation": "get_portfolios",
                "user_id": str(current_user_id),
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="포트폴리오 조회 중 오류가 발생했습니다.",
        )


@router.post("/")
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user_id: UUID = Depends(get_current_user_id),
):
    """새 포트폴리오 생성"""
    log_api_call(
        endpoint="POST /portfolios/",
        parameters={
            "user_id": str(current_user_id),
            "portfolio_name": portfolio_data.name,
        },
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "portfolio_create"
        ) as monitor:
            log_info(
                f"새 포트폴리오 생성 시작: {portfolio_data.name}",
                category="portfolio",
                context={"user_id": str(current_user_id)},
            )

            # 실제 포트폴리오 생성
            portfolio = await portfolio_service.create_portfolio(
                current_user_id, portfolio_data
            )

            response_data = {
                "id": str(portfolio.id),
                "name": portfolio.name,
                "description": portfolio.description,
                "total_value": float(portfolio.total_value),
                "current_balance": float(portfolio.current_balance),
                "initial_balance": float(portfolio.initial_balance),
                "risk_level": portfolio.risk_level,
                "investment_goal": portfolio.investment_goal,
                "target_return": (
                    float(portfolio.target_return) if portfolio.target_return else None
                ),
                "created_at": portfolio.created_at.isoformat(),
                "updated_at": portfolio.updated_at.isoformat(),
                "is_active": portfolio.is_active,
            }

            log_info(
                f"포트폴리오 생성 완료: {portfolio.name}",
                category="portfolio",
                context={"portfolio_id": str(portfolio.id)},
            )

            return JSONResponse(response_data, status_code=status.HTTP_201_CREATED)

    except Exception as e:
        log_error(
            "포트폴리오 생성 실패",
            category=ErrorCategory.BUSINESS_LOGIC.value,
            severity=ErrorSeverity.HIGH.value,
            context={
                "error": str(e),
                "error_type": type(e).__name__,
                "user_id": str(current_user_id),
            },
        )

        capture_exception(
            e,
            {
                "endpoint": "POST /portfolios/",
                "operation": "create_portfolio",
                "user_id": str(current_user_id),
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="포트폴리오 생성 중 오류가 발생했습니다.",
        )


@router.get("/{portfolio_id}")
async def get_portfolio_detail(
    portfolio_id: str, current_user_id: UUID = Depends(get_current_user_id)
):
    """포트폴리오 상세 정보 조회"""
    log_api_call(
        endpoint="GET /portfolios/{portfolio_id}",
        parameters={"portfolio_id": portfolio_id, "user_id": str(current_user_id)},
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "portfolio_detail"
        ) as monitor:
            log_info(
                f"포트폴리오 상세 조회 시작: {portfolio_id}",
                category="portfolio",
                context={"user_id": str(current_user_id)},
            )

            # 실제 포트폴리오 상세 정보 조회
            portfolio_detail = await portfolio_service.get_portfolio_detail(
                UUID(portfolio_id), current_user_id
            )

            if not portfolio_detail:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="포트폴리오를 찾을 수 없습니다.",
                )

            # 응답 데이터 구성
            response_data = {
                "portfolio": {
                    "id": str(portfolio_detail.portfolio.id),
                    "name": portfolio_detail.portfolio.name,
                    "description": portfolio_detail.portfolio.description,
                    "total_value": float(portfolio_detail.portfolio.total_value),
                    "current_balance": float(
                        portfolio_detail.portfolio.current_balance
                    ),
                    "initial_balance": float(
                        portfolio_detail.portfolio.initial_balance
                    ),
                    "risk_level": portfolio_detail.portfolio.risk_level,
                    "investment_goal": portfolio_detail.portfolio.investment_goal,
                    "target_return": (
                        float(portfolio_detail.portfolio.target_return)
                        if portfolio_detail.portfolio.target_return
                        else None
                    ),
                    "created_at": portfolio_detail.portfolio.created_at.isoformat(),
                    "updated_at": portfolio_detail.portfolio.updated_at.isoformat(),
                    "is_active": portfolio_detail.portfolio.is_active,
                },
                "holdings": [
                    {
                        "id": str(holding.id),
                        "symbol": holding.symbol,
                        "quantity": holding.quantity,
                        "average_cost": float(holding.average_cost),
                        "current_price": (
                            float(holding.current_price)
                            if holding.current_price
                            else None
                        ),
                        "market_value": (
                            float(holding.market_value)
                            if holding.market_value
                            else None
                        ),
                        "unrealized_pnl": (
                            float(holding.unrealized_pnl)
                            if holding.unrealized_pnl
                            else None
                        ),
                        "realized_pnl": float(holding.realized_pnl),
                        "first_purchase_date": holding.first_purchase_date.isoformat(),
                        "last_updated": holding.last_updated.isoformat(),
                    }
                    for holding in portfolio_detail.holdings
                ],
                "recent_transactions": [
                    {
                        "id": str(tx.id),
                        "symbol": tx.symbol,
                        "transaction_type": tx.transaction_type,
                        "quantity": tx.quantity,
                        "price": float(tx.price),
                        "fees": float(tx.fees),
                        "total_amount": float(tx.total_amount),
                        "executed_at": tx.executed_at.isoformat(),
                    }
                    for tx in portfolio_detail.recent_transactions
                ],
                "settings": (
                    {
                        "id": str(portfolio_detail.settings.id),
                        "max_position_size": float(
                            portfolio_detail.settings.max_position_size
                        ),
                        "max_sector_exposure": float(
                            portfolio_detail.settings.max_sector_exposure
                        ),
                        "stop_loss_threshold": float(
                            portfolio_detail.settings.stop_loss_threshold
                        ),
                        "take_profit_threshold": float(
                            portfolio_detail.settings.take_profit_threshold
                        ),
                        "rebalancing_frequency": portfolio_detail.settings.rebalancing_frequency,
                        "auto_rebalancing": portfolio_detail.settings.auto_rebalancing,
                        "notifications_enabled": portfolio_detail.settings.notifications_enabled,
                        "email_alerts": portfolio_detail.settings.email_alerts,
                    }
                    if portfolio_detail.settings
                    else None
                ),
                "performance_summary": portfolio_detail.performance_summary,
            }

            log_info(
                f"포트폴리오 상세 조회 완료: {portfolio_detail.portfolio.name}",
                category="portfolio",
                context={
                    "portfolio_id": portfolio_id,
                    "holdings_count": len(portfolio_detail.holdings),
                    "transactions_count": len(portfolio_detail.recent_transactions),
                },
            )

            return JSONResponse(response_data)

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            "포트폴리오 상세 조회 실패",
            category=ErrorCategory.BUSINESS_LOGIC.value,
            severity=ErrorSeverity.HIGH.value,
            context={
                "error": str(e),
                "error_type": type(e).__name__,
                "portfolio_id": portfolio_id,
            },
        )

        capture_exception(
            e,
            {
                "endpoint": "GET /portfolios/{portfolio_id}",
                "operation": "get_portfolio_detail",
                "portfolio_id": portfolio_id,
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="포트폴리오 상세 조회 중 오류가 발생했습니다.",
        )


@router.put("/{portfolio_id}")
async def update_portfolio(
    portfolio_id: str,
    update_data: PortfolioUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
):
    """포트폴리오 정보 업데이트"""
    log_api_call(
        endpoint="PUT /portfolios/{portfolio_id}",
        parameters={"portfolio_id": portfolio_id, "user_id": str(current_user_id)},
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "portfolio_update"
        ) as monitor:
            log_info(
                f"포트폴리오 업데이트 시작: {portfolio_id}",
                category="portfolio",
                context={"user_id": str(current_user_id)},
            )

            # 실제 포트폴리오 업데이트
            updated_portfolio = await portfolio_service.update_portfolio(
                UUID(portfolio_id), current_user_id, update_data
            )

            if not updated_portfolio:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="포트폴리오를 찾을 수 없습니다.",
                )

            response_data = {
                "id": str(updated_portfolio.id),
                "name": updated_portfolio.name,
                "description": updated_portfolio.description,
                "total_value": float(updated_portfolio.total_value),
                "current_balance": float(updated_portfolio.current_balance),
                "initial_balance": float(updated_portfolio.initial_balance),
                "risk_level": updated_portfolio.risk_level,
                "investment_goal": updated_portfolio.investment_goal,
                "target_return": (
                    float(updated_portfolio.target_return)
                    if updated_portfolio.target_return
                    else None
                ),
                "created_at": updated_portfolio.created_at.isoformat(),
                "updated_at": updated_portfolio.updated_at.isoformat(),
                "is_active": updated_portfolio.is_active,
            }

            log_info(
                f"포트폴리오 업데이트 완료: {updated_portfolio.name}",
                category="portfolio",
                context={"portfolio_id": portfolio_id},
            )

            return JSONResponse(response_data)

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            "포트폴리오 업데이트 실패",
            category=ErrorCategory.BUSINESS_LOGIC.value,
            severity=ErrorSeverity.HIGH.value,
            context={
                "error": str(e),
                "error_type": type(e).__name__,
                "portfolio_id": portfolio_id,
            },
        )

        capture_exception(
            e,
            {
                "endpoint": "PUT /portfolios/{portfolio_id}",
                "operation": "update_portfolio",
                "portfolio_id": portfolio_id,
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="포트폴리오 업데이트 중 오류가 발생했습니다.",
        )


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str, current_user_id: UUID = Depends(get_current_user_id)
):
    """포트폴리오 삭제"""
    log_api_call(
        endpoint="DELETE /portfolios/{portfolio_id}",
        parameters={"portfolio_id": portfolio_id, "user_id": str(current_user_id)},
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "portfolio_delete"
        ) as monitor:
            log_info(
                f"포트폴리오 삭제 시작: {portfolio_id}",
                category="portfolio",
                context={"user_id": str(current_user_id)},
            )

            # 실제 포트폴리오 삭제 (소프트 삭제)
            success = await portfolio_service.delete_portfolio(
                UUID(portfolio_id), current_user_id
            )

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="포트폴리오를 찾을 수 없습니다.",
                )

            log_info(
                f"포트폴리오 삭제 완료: {portfolio_id}",
                category="portfolio",
                context={"portfolio_id": portfolio_id},
            )

            return JSONResponse({"message": "포트폴리오가 성공적으로 삭제되었습니다."})

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            "포트폴리오 삭제 실패",
            category=ErrorCategory.BUSINESS_LOGIC.value,
            severity=ErrorSeverity.HIGH.value,
            context={
                "error": str(e),
                "error_type": type(e).__name__,
                "portfolio_id": portfolio_id,
            },
        )

        capture_exception(
            e,
            {
                "endpoint": "DELETE /portfolios/{portfolio_id}",
                "operation": "delete_portfolio",
                "portfolio_id": portfolio_id,
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="포트폴리오 삭제 중 오류가 발생했습니다.",
        )
