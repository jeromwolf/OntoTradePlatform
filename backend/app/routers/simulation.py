"""
주식 시뮬레이션 API 엔드포인트
OntoTradePlatform - Simulation Module
Supabase 통합 버전
"""

import asyncio
from typing import Dict, List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, Body
from fastapi.responses import JSONResponse

from app.core.auth import get_current_user_id
from app.core.logging_system import log_error, log_info
from app.services.stock_simulator import StockDataSimulator
from app.services.supabase_service import supabase_service
from app.services.stock_database_service import stock_db_service
from app.services.database_migration import db_migration

router = APIRouter(tags=["simulation"])

# 전역 시뮬레이터 인스턴스 (실시간 주가 데이터용)
simulator = StockDataSimulator()

# ❌ 메모리 기반 세션 제거 - 이제 Supabase 사용
# simulation_sessions: Dict[str, Dict] = {}


@router.get("/stocks")
async def get_stock_data():
    """현재 주식 데이터 조회 - 테이블 기반으로 변경"""
    try:
        # 새로운 방식: 데이터베이스에서 주식 데이터 조회
        stocks = await stock_db_service.get_all_active_stocks()
        
        if not stocks:
            # 데이터가 없으면 샘플 데이터 초기화
            log_info("주식 데이터가 없어서 샘플 데이터 초기화 중...")
            await stock_db_service.initialize_sample_data()
            stocks = await stock_db_service.get_all_active_stocks()
        
        # 기존 형식과 호환되도록 변환
        stock_data = {}
        for stock in stocks:
            stock_data[stock['symbol']] = {
                'symbol': stock['symbol'],
                'name': stock.get('name', ''),
                'price': float(stock.get('price', 0)),
                'change': float(stock.get('change_amount', 0)),
                'changePercent': float(stock.get('change_percent', 0)),
                'volume': int(stock.get('volume', 0)),
                'timestamp': stock.get('last_updated', '')
            }
        
        log_info(f"테이블에서 주식 데이터 조회: {len(stock_data)}개 종목")

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": stock_data,
                "timestamp": datetime.now().isoformat(),
                "source": "database"  # 새로운 필드로 출처 표시
            },
        )
    except Exception as e:
        log_error(f"주식 데이터 조회 중 오류: {str(e)}")
        
        # 폴백: 기존 시뮬레이터 방식
        try:
            log_info("데이터베이스 조회 실패, 시뮬레이터로 폴백...")
            if not simulator.is_running:
                await simulator.start_simulation()

            stock_data = simulator.get_all_stocks()
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "data": stock_data,
                    "timestamp": simulator.stock_data.get("AAPL", {}).get("timestamp", ""),
                    "source": "simulator"
                },
            )
        except Exception as fallback_error:
            log_error(f"폴백 시뮬레이터도 실패: {str(fallback_error)}")
            raise HTTPException(status_code=500, detail="주식 데이터 조회 실패")


@router.get("/stocks/search")
async def search_stocks(
    q: str = Query(..., min_length=1, description="검색어 (한글/영어 지원)"),
    limit: int = Query(20, ge=1, le=100, description="최대 결과 수")
):
    """주식 검색 API - 테이블 기반 한글/영어 검색"""
    try:
        log_info(f"Stock search request: query='{q}', limit={limit}")
        
        # 데이터베이스에서 검색
        stocks = await stock_db_service.search_stocks(q, limit)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": stocks,
                "query": q,
                "count": len(stocks),
                "timestamp": datetime.now().isoformat(),
            },
        )
    except Exception as e:
        log_error(f"주식 검색 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="주식 검색 실패")


@router.get("/stocks/all")
async def get_all_stocks():
    """모든 활성 주식 목록 조회"""
    try:
        stocks = await stock_db_service.get_all_active_stocks()
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": stocks,
                "count": len(stocks),
                "timestamp": datetime.now().isoformat(),
            },
        )
    except Exception as e:
        log_error(f"주식 목록 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="주식 목록 조회 실패")


@router.get("/stocks/{symbol}")
async def get_stock_detail(symbol: str):
    """특정 주식 상세 정보 조회"""
    try:
        stock = await stock_db_service.get_stock_by_symbol(symbol)
        
        if not stock:
            raise HTTPException(status_code=404, detail="주식을 찾을 수 없습니다")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": stock,
                "timestamp": datetime.now().isoformat(),
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        log_error(f"주식 상세 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="주식 상세 조회 실패")


@router.post("/stocks/sync")
async def sync_stock_data(
    symbols: Optional[List[str]] = Body(None, description="동기화할 심볼 목록 (비어있으면 전체)")
):
    """외부 API에서 주식 데이터 동기화"""
    try:
        log_info(f"Stock data sync requested: {symbols}")
        
        result = await stock_db_service.sync_from_external_api(symbols)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": result,
                "timestamp": datetime.now().isoformat(),
            },
        )
    except Exception as e:
        log_error(f"주식 데이터 동기화 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="주식 데이터 동기화 실패")


@router.post("/stocks/initialize")
async def initialize_stock_data():
    """주식 데이터 초기화 (샘플 데이터)"""
    try:
        success = await stock_db_service.initialize_sample_data()
        
        if success:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": "주식 데이터 초기화 완료",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        else:
            raise HTTPException(status_code=500, detail="주식 데이터 초기화 실패")
            
    except Exception as e:
        log_error(f"주식 데이터 초기화 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="주식 데이터 초기화 실패")


@router.post("/database/migrate")
async def migrate_database():
    """데이터베이스 테이블 자동 생성 및 마이그레이션"""
    try:
        log_info("Starting database migration...")
        
        result = await db_migration.run_full_migration()
        
        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": "데이터베이스 마이그레이션 완료",
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                },
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"마이그레이션 실패: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        log_error(f"데이터베이스 마이그레이션 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="데이터베이스 마이그레이션 실패")


@router.get("/database/status")
async def check_database_status():
    """데이터베이스 상태 확인"""
    try:
        # 주식 테이블 존재 여부 확인
        stocks_exists = await db_migration.check_table_exists('stocks')
        
        # 테이블 정보 조회
        table_info = await db_migration.get_table_info('stocks') if stocks_exists else None
        
        # 주식 데이터 개수 확인
        stock_count = 0
        if stocks_exists:
            try:
                stocks = await stock_db_service.get_all_active_stocks()
                stock_count = len(stocks)
            except:
                pass
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": {
                    "stocks_table_exists": stocks_exists,
                    "stock_count": stock_count,
                    "table_info": table_info,
                    "migration_needed": not stocks_exists,
                },
                "timestamp": datetime.now().isoformat(),
            },
        )
        
    except Exception as e:
        log_error(f"데이터베이스 상태 확인 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="데이터베이스 상태 확인 실패")


@router.post("/start")
async def start_simulation(user_id: str = Depends(get_current_user_id)):
    """사용자 시뮬레이션 세션 시작 - Supabase 연동"""
    try:
        # Supabase에서 기존 세션 확인
        session = await supabase_service.get_simulation_session(user_id)

        if session:
            log_info(f"기존 시뮬레이션 세션 재사용: {user_id}")
        else:
            # 새 세션 생성
            session = await supabase_service.create_simulation_session(user_id)
            log_info(f"새 시뮬레이션 세션 생성: {user_id}")

        # 시뮬레이터 시작 (실시간 주가 데이터용)
        if not simulator.is_running:
            await simulator.start_simulation()

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": session,
                "message": "시뮬레이션 세션이 시작되었습니다.",
            },
        )
    except Exception as e:
        log_error(f"시뮬레이션 시작 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="시뮬레이션 시작 실패")


@router.post("/trade")
async def execute_trade(
    symbol: str, action: str, quantity: int, user_id: str = Depends(get_current_user_id)
):
    """거래 실행 - Supabase 연동"""
    try:
        # 세션 확인
        session = await supabase_service.get_simulation_session(user_id)
        if not session:
            raise HTTPException(
                status_code=404, detail="시뮬레이션 세션을 찾을 수 없습니다."
            )

        # 현재 주식 가격 조회
        if symbol not in simulator.stock_data:
            raise HTTPException(status_code=404, detail="종목을 찾을 수 없습니다.")

        current_price = simulator.stock_data[symbol]["price"]
        total_amount = current_price * quantity

        if action.upper() == "BUY":
            # 매수 검증
            if session["cash"] < total_amount:
                raise HTTPException(status_code=400, detail="잔고가 부족합니다.")

            # 현재 보유종목 조회
            holdings = await supabase_service.get_simulation_holdings(user_id)
            existing_holding = next(
                (h for h in holdings if h["symbol"] == symbol), None
            )

            # 매수 실행
            new_cash = session["cash"] - total_amount

            if existing_holding:
                # 기존 보유 종목에 추가
                total_quantity = existing_holding["quantity"] + quantity
                total_cost = (
                    existing_holding["avg_price"] * existing_holding["quantity"]
                ) + total_amount
                avg_price = total_cost / total_quantity

                await supabase_service.upsert_holding(
                    user_id, symbol, total_quantity, avg_price
                )
            else:
                # 새 종목 추가
                await supabase_service.upsert_holding(
                    user_id, symbol, quantity, current_price
                )

            # 거래내역 추가
            await supabase_service.add_transaction(
                user_id, symbol, "buy", quantity, current_price
            )

        elif action.upper() == "SELL":
            # 현재 보유종목 조회
            holdings = await supabase_service.get_simulation_holdings(user_id)
            existing_holding = next(
                (h for h in holdings if h["symbol"] == symbol), None
            )

            # 매도 검증
            if not existing_holding or existing_holding["quantity"] < quantity:
                raise HTTPException(status_code=400, detail="보유 수량이 부족합니다.")

            # 매도 실행
            new_cash = session["cash"] + total_amount
            new_quantity = existing_holding["quantity"] - quantity

            if new_quantity == 0:
                # 전량 매도 - 보유종목 삭제
                await supabase_service.upsert_holding(user_id, symbol, 0, 0)
            else:
                # 일부 매도 - 수량만 업데이트
                await supabase_service.upsert_holding(
                    user_id, symbol, new_quantity, existing_holding["avg_price"]
                )

            # 거래내역 추가
            await supabase_service.add_transaction(
                user_id, symbol, "sell", quantity, current_price
            )

        else:
            raise HTTPException(status_code=400, detail="잘못된 거래 유형입니다.")

        # 포트폴리오 가치 재계산
        holdings = await supabase_service.get_simulation_holdings(user_id)
        holdings_value = 0

        for holding in holdings:
            if holding["symbol"] in simulator.stock_data:
                market_price = simulator.stock_data[holding["symbol"]]["price"]
                holdings_value += market_price * holding["quantity"]

        new_total_value = new_cash + holdings_value
        new_total_pnl = new_total_value - 100000000
        new_total_pnl_percent = (new_total_pnl / 100000000) * 100

        # 세션 업데이트
        await supabase_service.update_simulation_session(
            user_id,
            cash=new_cash,
            total_value=new_total_value,
            total_pnl=new_total_pnl,
            total_pnl_percent=new_total_pnl_percent,
        )

        log_info(
            f"거래 실행: {user_id} - {action} {quantity} {symbol} @ {current_price}"
        )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": {
                    "symbol": symbol,
                    "action": action.upper(),
                    "quantity": quantity,
                    "price": current_price,
                    "total_amount": total_amount,
                    "new_cash": new_cash,
                    "new_total_value": new_total_value,
                },
                "message": f"{action} 거래가 성공적으로 실행되었습니다.",
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        log_error(f"거래 실행 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="거래 실행 실패")


@router.get("/portfolio")
async def get_simulation_portfolio(user_id: str = Depends(get_current_user_id)):
    """시뮬레이션 포트폴리오 조회 - Supabase 연동"""
    try:
        # 세션 조회
        session = await supabase_service.get_simulation_session(user_id)
        if not session:
            raise HTTPException(
                status_code=404, detail="시뮬레이션 세션을 찾을 수 없습니다."
            )

        # 보유종목 조회
        holdings = await supabase_service.get_simulation_holdings(user_id)

        # 보유 종목 상세 정보 생성
        detailed_holdings = []
        holdings_value = 0

        for holding in holdings:
            symbol = holding["symbol"]
            if symbol in simulator.stock_data:
                current_price = simulator.stock_data[symbol]["price"]
                market_value = current_price * holding["quantity"]
                cost_basis = holding["avg_price"] * holding["quantity"]
                unrealized_pnl = market_value - cost_basis
                unrealized_pnl_percent = (
                    (unrealized_pnl / cost_basis) * 100 if cost_basis > 0 else 0
                )

                holdings_value += market_value

                detailed_holdings.append(
                    {
                        "symbol": symbol,
                        "quantity": holding["quantity"],
                        "avg_price": holding["avg_price"],
                        "current_price": current_price,
                        "market_value": round(market_value, 2),
                        "cost_basis": round(cost_basis, 2),
                        "unrealized_pnl": round(unrealized_pnl, 2),
                        "unrealized_pnl_percent": round(unrealized_pnl_percent, 2),
                        "created_at": holding.get("created_at"),
                        "updated_at": holding.get("updated_at"),
                    }
                )

        # 최신 총 자산 계산
        current_total_value = session["cash"] + holdings_value
        current_total_pnl = current_total_value - 100000000
        current_total_pnl_percent = (current_total_pnl / 100000000) * 100

        # 최근 거래내역 조회
        recent_transactions = await supabase_service.get_transactions(user_id, limit=10)

        portfolio_data = {
            **session,
            "detailed_holdings": detailed_holdings,
            "holdings_value": round(holdings_value, 2),
            "current_total_value": round(current_total_value, 2),
            "current_total_pnl": round(current_total_pnl, 2),
            "current_total_pnl_percent": round(current_total_pnl_percent, 2),
            "holdings_count": len(detailed_holdings),
            "recent_transactions": recent_transactions,
        }

        log_info(f"포트폴리오 조회: {user_id}")

        return JSONResponse(
            status_code=200, content={"success": True, "data": portfolio_data}
        )

    except HTTPException:
        raise
    except Exception as e:
        log_error(f"포트폴리오 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="포트폴리오 조회 실패")


@router.get("/leaderboard")
async def get_simulation_leaderboard():
    """시뮬레이션 리더보드 조회 - Supabase 연동"""
    try:
        # 모든 시뮬레이션 세션을 수익률 순으로 조회
        leaderboard_data = await supabase_service.get_simulation_leaderboard()

        log_info("리더보드 조회")

        return JSONResponse(
            status_code=200, content={"success": True, "data": leaderboard_data}
        )

    except Exception as e:
        log_error(f"리더보드 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="리더보드 조회 실패")


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """실시간 주식 데이터 WebSocket"""
    await websocket.accept()

    try:
        # 시뮬레이터 시작
        if not simulator.is_running:
            await simulator.start_simulation()

        while True:
            # 현재 주식 데이터 전송
            stock_data = simulator.get_all_stocks()
            await websocket.send_json(
                {
                    "type": "stock_update",
                    "data": stock_data,
                    "timestamp": stock_data.get("AAPL", {}).get("timestamp", ""),
                }
            )

            # 2초마다 업데이트
            await asyncio.sleep(2)

    except WebSocketDisconnect:
        log_info("WebSocket 연결 종료")
    except Exception as e:
        log_error(f"WebSocket 오류: {str(e)}")
        await websocket.close()


@router.on_event("shutdown")
async def shutdown_event():
    """서버 종료 시 시뮬레이터 정리"""
    if simulator.is_running:
        await simulator.stop_simulation()
