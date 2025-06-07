"""WebSocket 관련 API 엔드포인트."""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import logging

from app.core.websocket import (
    get_websocket_stats,
    emit_stock_update,
    emit_market_status,
    ws_manager
)

# 임시 인증 함수 (개발용)
async def get_current_user_optional() -> Optional[Dict]:
    """개발용 선택적 인증 함수."""
    return {"user_id": "dev_user", "role": "admin"}

router = APIRouter(prefix="/websocket", tags=["WebSocket"])
logger = logging.getLogger(__name__)


@router.get("/stats")
async def get_connection_stats():
    """
    WebSocket 연결 통계를 조회합니다.
    
    Returns:
        연결된 클라이언트 수, 구독 정보 등의 통계
    """
    try:
        stats = get_websocket_stats()
        return JSONResponse({
            "status": "success",
            "data": stats
        })
    except Exception as e:
        logger.error(f"WebSocket 통계 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="통계 조회 중 오류가 발생했습니다.")


@router.post("/broadcast/stock")
async def broadcast_stock_data(
    symbol: str,
    data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user_optional)
):
    """
    특정 주식의 데이터를 구독자들에게 브로드캐스트합니다.
    
    Args:
        symbol: 주식 심볼
        data: 전송할 데이터
        current_user: 현재 사용자 (인증 필요)
    """
    try:
        await emit_stock_update(symbol.upper(), data)
        return JSONResponse({
            "status": "success",
            "message": f"{symbol} 데이터가 성공적으로 전송되었습니다.",
            "recipients": len(ws_manager.stock_subscribers.get(symbol.upper(), []))
        })
    except Exception as e:
        logger.error(f"주식 데이터 브로드캐스트 오류: {e}")
        raise HTTPException(status_code=500, detail="데이터 전송 중 오류가 발생했습니다.")


@router.post("/broadcast/market-status")
async def broadcast_market_status(
    status: Dict[str, Any],
    current_user: Dict = Depends(get_current_user_optional)
):
    """
    시장 상태를 모든 클라이언트에게 브로드캐스트합니다.
    
    Args:
        status: 시장 상태 데이터
        current_user: 현재 사용자 (인증 필요)
    """
    try:
        await emit_market_status(status)
        return JSONResponse({
            "status": "success",
            "message": "시장 상태가 성공적으로 전송되었습니다.",
            "recipients": len(ws_manager.active_connections)
        })
    except Exception as e:
        logger.error(f"시장 상태 브로드캐스트 오류: {e}")
        raise HTTPException(status_code=500, detail="시장 상태 전송 중 오류가 발생했습니다.")


@router.get("/active-subscriptions")
async def get_active_subscriptions(
    current_user: Dict = Depends(get_current_user_optional)
):
    """
    현재 활성화된 모든 구독 정보를 조회합니다.
    
    Returns:
        주식별 구독자 목록과 통계
    """
    try:
        subscriptions_data = {}
        
        for symbol, subscribers in ws_manager.stock_subscribers.items():
            subscriptions_data[symbol] = {
                "subscriber_count": len(subscribers),
                "subscribers": subscribers  # 실제 운영에서는 보안상 제거 고려
            }
        
        return JSONResponse({
            "status": "success",
            "data": {
                "subscriptions": subscriptions_data,
                "total_symbols": len(ws_manager.stock_subscribers),
                "total_subscribers": len(ws_manager.active_connections)
            }
        })
    except Exception as e:
        logger.error(f"구독 정보 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="구독 정보 조회 중 오류가 발생했습니다.")


@router.delete("/connections/{session_id}")
async def disconnect_client(
    session_id: str,
    current_user: Dict = Depends(get_current_user_optional)
):
    """
    특정 클라이언트의 연결을 강제로 해제합니다.
    
    Args:
        session_id: 연결 해제할 세션 ID
        current_user: 현재 사용자 (관리자 권한 필요)
    """
    try:
        if session_id in ws_manager.active_connections:
            await ws_manager.sio.disconnect(session_id)
            return JSONResponse({
                "status": "success",
                "message": f"세션 {session_id}의 연결이 해제되었습니다."
            })
        else:
            raise HTTPException(status_code=404, detail="해당 세션을 찾을 수 없습니다.")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"연결 해제 오류: {e}")
        raise HTTPException(status_code=500, detail="연결 해제 중 오류가 발생했습니다.")


@router.get("/health")
async def websocket_health_check():
    """
    WebSocket 서버의 건강 상태를 확인합니다.
    
    Returns:
        WebSocket 서버 상태 정보
    """
    try:
        stats = get_websocket_stats()
        
        # 서버 상태 판단
        is_healthy = True
        health_details = {
            "server_status": "running",
            "connections": stats["total_connections"],
            "subscriptions": stats["total_subscriptions"],
            "active_symbols": stats["unique_stocks_subscribed"]
        }
        
        return JSONResponse({
            "status": "healthy" if is_healthy else "unhealthy",
            "data": health_details
        })
        
    except Exception as e:
        logger.error(f"WebSocket 건강 상태 확인 오류: {e}")
        return JSONResponse({
            "status": "unhealthy",
            "error": str(e)
        }, status_code=500)


# 테스트용 엔드포인트들 (개발 환경에서만 사용)
@router.post("/test/emit")
async def test_emit_data(
    event_name: str,
    data: Dict[str, Any],
    target_session: str = None
):
    """
    테스트용 WebSocket 이벤트 전송 엔드포인트.
    개발 환경에서만 사용해야 합니다.
    """
    try:
        if target_session:
            await ws_manager.sio.emit(event_name, data, room=target_session)
            message = f"이벤트 '{event_name}'이 세션 {target_session}에 전송되었습니다."
        else:
            await ws_manager.sio.emit(event_name, data)
            message = f"이벤트 '{event_name}'이 모든 클라이언트에 전송되었습니다."
        
        return JSONResponse({
            "status": "success",
            "message": message
        })
        
    except Exception as e:
        logger.error(f"테스트 이벤트 전송 오류: {e}")
        raise HTTPException(status_code=500, detail="이벤트 전송 중 오류가 발생했습니다.")
