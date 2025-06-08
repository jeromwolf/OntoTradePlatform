"""
포트폴리오 보유 종목 관리 API 엔드포인트

포트폴리오 내 보유 종목 추가, 수정, 삭제, 거래 기록 등의 기능을 제공합니다.
"""

from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

from app.core.auth import get_current_user_id
from app.core.logging_system import (
    ErrorCategory,
    ErrorSeverity,
    log_api_call,
    log_error,
    log_info,
    logging_system,
)
from app.core.monitoring import capture_exception
from app.models.portfolio import HoldingCreate, TransactionCreate, TransactionType
from app.services.portfolio_service import PortfolioService

router = APIRouter()
portfolio_service = PortfolioService()


@router.post("/{portfolio_id}/holdings")
async def add_holding(
    portfolio_id: str,
    holding_data: HoldingCreate,
    current_user_id: UUID = Depends(get_current_user_id),
):
    """포트폴리오에 새 보유 종목 추가"""
    log_api_call(
        endpoint="POST /portfolios/{portfolio_id}/holdings",
        parameters={
            "portfolio_id": portfolio_id,
            "user_id": str(current_user_id),
            "symbol": holding_data.symbol,
        },
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "add_holding"
        ) as monitor:
            log_info(
                f"보유 종목 추가 시작: {holding_data.symbol}",
                category="portfolio",
                context={"portfolio_id": portfolio_id, "user_id": str(current_user_id)},
            )

            # 실제 보유 종목 추가
            holding = await portfolio_service.add_holding(
                UUID(portfolio_id), current_user_id, holding_data
            )

            response_data = {
                "id": str(holding.id),
                "portfolio_id": str(holding.portfolio_id),
                "symbol": holding.symbol,
                "quantity": holding.quantity,
                "average_cost": float(holding.average_cost),
                "current_price": (
                    float(holding.current_price) if holding.current_price else None
                ),
                "market_value": (
                    float(holding.market_value) if holding.market_value else None
                ),
                "unrealized_pnl": (
                    float(holding.unrealized_pnl) if holding.unrealized_pnl else None
                ),
                "realized_pnl": float(holding.realized_pnl),
                "first_purchase_date": holding.first_purchase_date.isoformat(),
                "last_updated": holding.last_updated.isoformat(),
            }

            log_info(
                f"보유 종목 추가 완료: {holding.symbol}",
                category="portfolio",
                context={"holding_id": str(holding.id), "quantity": holding.quantity},
            )

            return JSONResponse(response_data, status_code=status.HTTP_201_CREATED)

    except Exception as e:
        log_error(
            "보유 종목 추가 실패",
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
                "endpoint": "POST /portfolios/{portfolio_id}/holdings",
                "operation": "add_holding",
                "portfolio_id": portfolio_id,
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="보유 종목 추가 중 오류가 발생했습니다.",
        )


@router.post("/{portfolio_id}/transactions")
async def record_transaction(
    portfolio_id: str,
    transaction_data: TransactionCreate,
    current_user_id: UUID = Depends(get_current_user_id),
):
    """포트폴리오에 거래 기록 추가"""
    log_api_call(
        endpoint="POST /portfolios/{portfolio_id}/transactions",
        parameters={
            "portfolio_id": portfolio_id,
            "user_id": str(current_user_id),
            "symbol": transaction_data.symbol,
            "transaction_type": transaction_data.transaction_type,
        },
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "record_transaction"
        ) as monitor:
            log_info(
                f"거래 기록 시작: {transaction_data.symbol} {transaction_data.transaction_type}",
                category="portfolio",
                context={
                    "portfolio_id": portfolio_id,
                    "user_id": str(current_user_id),
                    "quantity": transaction_data.quantity,
                },
            )

            # 실제 거래 기록
            transaction = await portfolio_service.record_transaction(
                UUID(portfolio_id), current_user_id, transaction_data
            )

            response_data = {
                "id": str(transaction.id),
                "portfolio_id": str(transaction.portfolio_id),
                "symbol": transaction.symbol,
                "transaction_type": transaction.transaction_type,
                "quantity": transaction.quantity,
                "price": float(transaction.price),
                "fees": float(transaction.fees),
                "total_amount": float(transaction.total_amount),
                "notes": transaction.notes,
                "executed_at": transaction.executed_at.isoformat(),
                "created_at": transaction.created_at.isoformat(),
            }

            log_info(
                f"거래 기록 완료: {transaction.symbol} {transaction.transaction_type}",
                category="portfolio",
                context={
                    "transaction_id": str(transaction.id),
                    "total_amount": float(transaction.total_amount),
                },
            )

            return JSONResponse(response_data, status_code=status.HTTP_201_CREATED)

    except Exception as e:
        log_error(
            "거래 기록 실패",
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
                "endpoint": "POST /portfolios/{portfolio_id}/transactions",
                "operation": "record_transaction",
                "portfolio_id": portfolio_id,
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="거래 기록 중 오류가 발생했습니다.",
        )


@router.get("/{portfolio_id}/performance")
async def get_portfolio_performance(
    portfolio_id: str,
    current_user_id: UUID = Depends(get_current_user_id),
    start_date: str = Query(None, description="시작 날짜 (YYYY-MM-DD)"),
    end_date: str = Query(None, description="종료 날짜 (YYYY-MM-DD)"),
):
    """포트폴리오 성과 조회"""
    log_api_call(
        endpoint="GET /portfolios/{portfolio_id}/performance",
        parameters={
            "portfolio_id": portfolio_id,
            "user_id": str(current_user_id),
            "start_date": start_date,
            "end_date": end_date,
        },
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "portfolio_performance"
        ) as monitor:
            log_info(
                f"포트폴리오 성과 조회 시작: {portfolio_id}",
                category="portfolio",
                context={"user_id": str(current_user_id)},
            )

            # 날짜 파라미터 파싱
            start_datetime = None
            end_datetime = None

            if start_date:
                try:
                    start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="시작 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)",
                    )

            if end_date:
                try:
                    end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="종료 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)",
                    )

            # 실제 성과 데이터 조회
            performance_data = await portfolio_service.get_portfolio_performance(
                UUID(portfolio_id), current_user_id, start_datetime, end_datetime
            )

            response_data = [
                {
                    "id": str(perf.id),
                    "date": perf.date.isoformat(),
                    "total_value": float(perf.total_value),
                    "total_return": float(perf.total_return),
                    "total_return_percent": float(perf.total_return_percent),
                    "daily_return": (
                        float(perf.daily_return) if perf.daily_return else None
                    ),
                    "daily_return_percent": (
                        float(perf.daily_return_percent)
                        if perf.daily_return_percent
                        else None
                    ),
                    "cumulative_return": float(perf.cumulative_return),
                    "cumulative_return_percent": float(perf.cumulative_return_percent),
                    "benchmark_return": (
                        float(perf.benchmark_return) if perf.benchmark_return else None
                    ),
                    "alpha": float(perf.alpha) if perf.alpha else None,
                    "beta": float(perf.beta) if perf.beta else None,
                    "sharpe_ratio": (
                        float(perf.sharpe_ratio) if perf.sharpe_ratio else None
                    ),
                    "volatility": float(perf.volatility) if perf.volatility else None,
                    "max_drawdown": (
                        float(perf.max_drawdown) if perf.max_drawdown else None
                    ),
                    "created_at": perf.created_at.isoformat(),
                }
                for perf in performance_data
            ]

            log_info(
                f"포트폴리오 성과 조회 완료: {portfolio_id}",
                category="portfolio",
                context={"performance_records": len(performance_data)},
            )

            return JSONResponse(
                {
                    "portfolio_id": portfolio_id,
                    "performance_data": response_data,
                    "period": {"start_date": start_date, "end_date": end_date},
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            "포트폴리오 성과 조회 실패",
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
                "endpoint": "GET /portfolios/{portfolio_id}/performance",
                "operation": "get_portfolio_performance",
                "portfolio_id": portfolio_id,
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="포트폴리오 성과 조회 중 오류가 발생했습니다.",
        )
