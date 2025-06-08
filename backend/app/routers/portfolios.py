"""
포트폴리오 관리 API 엔드포인트
OntoTradePlatform - Task 5.1 & 5.2
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from app.core.auth import get_current_user
from app.core.logging_system import log_error, log_info
from app.models.portfolio import (
    Portfolio,
    PortfolioCreate,
    PortfolioDetail,
    PortfolioSummary,
    PortfolioUpdate,
    Settings,
    SettingsUpdate,
    Transaction,
    TransactionCreate,
)
from app.services.portfolio_service import PortfolioService
from app.services.trading_service import TradingService

router = APIRouter(tags=["portfolios"])


# Portfolio CRUD Operations
@router.post("/", response_model=Portfolio)
async def create_portfolio(
    portfolio_data: PortfolioCreate, current_user=Depends(get_current_user)
):
    """새 포트폴리오 생성"""
    try:
        service = PortfolioService()
        portfolio = await service.create_portfolio(
            user_id=UUID(current_user["id"]), portfolio_data=portfolio_data
        )

        log_info(f"포트폴리오 '{portfolio_data.name}' 생성 성공")

        return portfolio

    except Exception as e:
        log_error(
            f"portfolios_api create_portfolio error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[Portfolio])
async def get_portfolios(current_user=Depends(get_current_user)):
    """사용자 포트폴리오 목록 조회"""
    try:
        service = PortfolioService()
        portfolios = await service.get_portfolios(user_id=UUID(current_user["id"]))

        log_info(f"사용자 '{current_user['id']}' 포트폴리오 목록 조회 성공")

        return portfolios

    except Exception as e:
        log_error(
            f"portfolios_api get_portfolios error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{portfolio_id}", response_model=PortfolioDetail)
async def get_portfolio_detail(
    portfolio_id: UUID, current_user=Depends(get_current_user)
):
    """포트폴리오 상세 정보 조회"""
    try:
        service = PortfolioService()
        detail = await service.get_portfolio_detail(
            portfolio_id=portfolio_id, user_id=UUID(current_user["id"])
        )

        if not detail:
            raise HTTPException(status_code=404, detail="포트폴리오를 찾을 수 없습니다")

        log_info(f"포트폴리오 '{portfolio_id}' 상세 정보 조회 성공")

        return detail

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            f"portfolios_api get_portfolio_detail error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{portfolio_id}", response_model=Portfolio)
async def update_portfolio(
    portfolio_id: UUID,
    update_data: PortfolioUpdate,
    current_user=Depends(get_current_user),
):
    """포트폴리오 정보 업데이트"""
    try:
        service = PortfolioService()
        portfolio = await service.update_portfolio(
            portfolio_id=portfolio_id,
            user_id=UUID(current_user["id"]),
            update_data=update_data,
        )

        if not portfolio:
            raise HTTPException(status_code=404, detail="포트폴리오를 찾을 수 없습니다")

        log_info(f"포트폴리오 '{portfolio_id}' 정보 업데이트 성공")

        return portfolio

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            f"portfolios_api update_portfolio error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{portfolio_id}")
async def delete_portfolio(portfolio_id: UUID, current_user=Depends(get_current_user)):
    """포트폴리오 삭제"""
    try:
        service = PortfolioService()
        success = await service.delete_portfolio(
            portfolio_id=portfolio_id, user_id=UUID(current_user["id"])
        )

        if not success:
            raise HTTPException(status_code=404, detail="포트폴리오를 찾을 수 없습니다")

        log_info(f"포트폴리오 '{portfolio_id}' 삭제 성공")

        return JSONResponse(
            status_code=200,
            content={"message": "포트폴리오가 성공적으로 삭제되었습니다"},
        )

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            f"portfolios_api delete_portfolio error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))


# Trading Operations
@router.post("/{portfolio_id}/trade")
async def execute_trade(
    portfolio_id: UUID,
    transaction_data: TransactionCreate,
    current_user=Depends(get_current_user),
):
    """거래 실행 (매수/매도)"""
    try:
        # portfolio_id 설정
        transaction_data.portfolio_id = portfolio_id

        service = TradingService()
        result = await service.execute_trade(
            user_id=UUID(current_user["id"]), transaction_data=transaction_data
        )

        log_info(
            f"거래 '{transaction_data.symbol}' '{transaction_data.transaction_type.value}' 성공"
        )

        return JSONResponse(status_code=200, content=result)

    except ValueError as e:
        log_error(
            f"portfolios_api execute_trade error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_error(
            f"portfolios_api execute_trade error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{portfolio_id}/transactions")
async def get_transaction_history(
    portfolio_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    current_user=Depends(get_current_user),
):
    """거래 내역 조회"""
    try:
        service = TradingService()
        transactions = await service.get_transaction_history(
            portfolio_id=portfolio_id, user_id=UUID(current_user["id"]), limit=limit
        )

        log_info(f"거래 내역 '{portfolio_id}' 조회 성공")

        return JSONResponse(status_code=200, content=transactions)

    except ValueError as e:
        log_error(
            f"portfolios_api get_transaction_history error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_error(
            f"portfolios_api get_transaction_history error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))


# Portfolio Settings
@router.get("/{portfolio_id}/settings", response_model=Settings)
async def get_portfolio_settings(
    portfolio_id: UUID, current_user=Depends(get_current_user)
):
    """포트폴리오 설정 조회"""
    try:
        from app.core.supabase import get_supabase_client

        supabase = get_supabase_client()

        # 포트폴리오 소유권 확인
        portfolio_result = (
            supabase.table("portfolios")
            .select("id")
            .eq("id", str(portfolio_id))
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )

        if not portfolio_result.data:
            raise HTTPException(status_code=404, detail="포트폴리오를 찾을 수 없습니다")

        # 설정 조회
        settings_result = (
            supabase.table("portfolio_settings")
            .select("*")
            .eq("portfolio_id", str(portfolio_id))
            .single()
            .execute()
        )

        if not settings_result.data:
            raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")

        log_info(f"포트폴리오 '{portfolio_id}' 설정 조회 성공")

        return Settings(**settings_result.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{portfolio_id}/settings", response_model=Settings)
async def update_portfolio_settings(
    portfolio_id: UUID,
    settings_data: SettingsUpdate,
    current_user=Depends(get_current_user),
):
    """포트폴리오 설정 업데이트"""
    try:
        from app.core.supabase import get_supabase_client

        supabase = get_supabase_client()

        # 포트폴리오 소유권 확인
        portfolio_result = (
            supabase.table("portfolios")
            .select("id")
            .eq("id", str(portfolio_id))
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )

        if not portfolio_result.data:
            raise HTTPException(status_code=404, detail="포트폴리오를 찾을 수 없습니다")

        # 업데이트할 필드 준비
        update_dict = {}
        if settings_data.max_position_size is not None:
            update_dict["max_position_size"] = float(settings_data.max_position_size)
        if settings_data.max_sector_exposure is not None:
            update_dict["max_sector_exposure"] = float(
                settings_data.max_sector_exposure
            )
        if settings_data.stop_loss_threshold is not None:
            update_dict["stop_loss_threshold"] = float(
                settings_data.stop_loss_threshold
            )
        if settings_data.take_profit_threshold is not None:
            update_dict["take_profit_threshold"] = float(
                settings_data.take_profit_threshold
            )
        if settings_data.rebalancing_frequency is not None:
            update_dict["rebalancing_frequency"] = (
                settings_data.rebalancing_frequency.value
            )
        if settings_data.auto_rebalancing is not None:
            update_dict["auto_rebalancing"] = settings_data.auto_rebalancing
        if settings_data.notifications_enabled is not None:
            update_dict["notifications_enabled"] = settings_data.notifications_enabled
        if settings_data.email_alerts is not None:
            update_dict["email_alerts"] = settings_data.email_alerts

        if not update_dict:
            raise HTTPException(status_code=400, detail="업데이트할 필드가 없습니다")

        # 설정 업데이트
        result = (
            supabase.table("portfolio_settings")
            .update(update_dict)
            .eq("portfolio_id", str(portfolio_id))
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")

        log_info(f"포트폴리오 '{portfolio_id}' 설정 업데이트 성공")

        return Settings(**result.data[0])

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            f"portfolios_api update_portfolio_settings error: user_id={current_user['id']}, error={str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))
