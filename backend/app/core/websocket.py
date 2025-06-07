"""WebSocket 서버 구현."""

import asyncio
import logging
from typing import Dict, Any, Optional, List
import socketio
from fastapi import FastAPI
import json

from app.core.config import settings

# 로거 설정
logger = logging.getLogger(__name__)

# Socket.IO 서버 인스턴스 (더 간단한 설정)
sio = socketio.AsyncServer(
    cors_allowed_origins="*",  # 개발 중에는 모든 오리진 허용
    logger=False,  # 너무 많은 로그 방지
    engineio_logger=False
)

# 연결된 클라이언트 관리
connected_clients: Dict[str, Dict[str, Any]] = {}

# 구독 관리 (클라이언트별 구독 정보)
subscriptions: Dict[str, List[str]] = {}


class WebSocketManager:
    """WebSocket 연결 및 실시간 데이터 관리 클래스."""
    
    def __init__(self):
        self.sio = sio
        self.active_connections: Dict[str, Dict[str, Any]] = {}
        self.stock_subscribers: Dict[str, List[str]] = {}  # 주식별 구독자 목록
        
    async def connect(self, sid: str, environ: Dict[str, Any]) -> None:
        """클라이언트 연결 처리."""
        client_info = {
            'sid': sid,
            'connected_at': asyncio.get_event_loop().time(),
            'subscriptions': [],
            'user_id': None
        }
        
        self.active_connections[sid] = client_info
        logger.info(f"클라이언트 연결됨: {sid}")
        
        # 연결 확인 메시지 전송
        await self.sio.emit('connection_confirmed', {
            'status': 'connected',
            'sid': sid,
            'server_time': asyncio.get_event_loop().time()
        }, room=sid)
    
    async def disconnect(self, sid: str) -> None:
        """클라이언트 연결 해제 처리."""
        if sid in self.active_connections:
            # 모든 구독 해제
            client_subscriptions = self.active_connections[sid].get('subscriptions', [])
            for symbol in client_subscriptions:
                await self.unsubscribe_from_stock(sid, symbol)
            
            # 연결 정보 제거
            del self.active_connections[sid]
            logger.info(f"클라이언트 연결 해제됨: {sid}")
    
    async def subscribe_to_stock(self, sid: str, symbol: str) -> None:
        """주식 데이터 구독."""
        if sid not in self.active_connections:
            return
        
        # 클라이언트 구독 목록에 추가
        if symbol not in self.active_connections[sid]['subscriptions']:
            self.active_connections[sid]['subscriptions'].append(symbol)
        
        # 주식별 구독자 목록에 추가
        if symbol not in self.stock_subscribers:
            self.stock_subscribers[symbol] = []
        
        if sid not in self.stock_subscribers[symbol]:
            self.stock_subscribers[symbol].append(sid)
        
        logger.info(f"클라이언트 {sid}가 {symbol} 구독 시작")
        
        # 구독 확인 메시지 전송
        await self.sio.emit('subscription_confirmed', {
            'symbol': symbol,
            'status': 'subscribed'
        }, room=sid)
    
    async def unsubscribe_from_stock(self, sid: str, symbol: str) -> None:
        """주식 데이터 구독 해제."""
        if sid in self.active_connections:
            # 클라이언트 구독 목록에서 제거
            if symbol in self.active_connections[sid]['subscriptions']:
                self.active_connections[sid]['subscriptions'].remove(symbol)
        
        # 주식별 구독자 목록에서 제거
        if symbol in self.stock_subscribers and sid in self.stock_subscribers[symbol]:
            self.stock_subscribers[symbol].remove(sid)
            
            # 구독자가 없으면 주식 목록에서도 제거
            if not self.stock_subscribers[symbol]:
                del self.stock_subscribers[symbol]
        
        logger.info(f"클라이언트 {sid}가 {symbol} 구독 해제")
        
        # 구독 해제 확인 메시지 전송
        await self.sio.emit('subscription_cancelled', {
            'symbol': symbol,
            'status': 'unsubscribed'
        }, room=sid)
    
    async def broadcast_stock_data(self, symbol: str, data: Dict[str, Any]) -> None:
        """특정 주식의 실시간 데이터를 구독자들에게 브로드캐스트."""
        if symbol in self.stock_subscribers:
            subscribers = self.stock_subscribers[symbol]
            if subscribers:
                # 모든 구독자에게 데이터 전송
                for sid in subscribers:
                    try:
                        await self.sio.emit('stock_data_update', {
                            'symbol': symbol,
                            'data': data,
                            'timestamp': asyncio.get_event_loop().time()
                        }, room=sid)
                    except Exception as e:
                        logger.error(f"데이터 전송 실패 (클라이언트: {sid}): {e}")
                
                logger.debug(f"{symbol} 데이터를 {len(subscribers)}명의 구독자에게 전송")
    
    async def broadcast_market_status(self, status: Dict[str, Any]) -> None:
        """시장 상태를 모든 연결된 클라이언트에게 브로드캐스트."""
        if self.active_connections:
            try:
                await self.sio.emit('market_status_update', {
                    'status': status,
                    'timestamp': asyncio.get_event_loop().time()
                })
                logger.debug(f"시장 상태를 {len(self.active_connections)}명의 클라이언트에게 전송")
            except Exception as e:
                logger.error(f"시장 상태 브로드캐스트 실패: {e}")
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """연결 통계 반환."""
        total_connections = len(self.active_connections)
        total_subscriptions = sum(len(info['subscriptions']) for info in self.active_connections.values())
        unique_stocks = len(self.stock_subscribers)
        
        return {
            'total_connections': total_connections,
            'total_subscriptions': total_subscriptions,
            'unique_stocks_subscribed': unique_stocks,
            'active_stocks': list(self.stock_subscribers.keys())
        }


# WebSocket 매니저 인스턴스
ws_manager = WebSocketManager()


# Socket.IO 이벤트 핸들러들
@sio.event
async def connect(sid, environ):
    """클라이언트 연결 이벤트 핸들러."""
    await ws_manager.connect(sid, environ)


@sio.event
async def disconnect(sid):
    """클라이언트 연결 해제 이벤트 핸들러."""
    await ws_manager.disconnect(sid)


@sio.event
async def subscribe_stock(sid, data):
    """주식 데이터 구독 요청 핸들러."""
    try:
        symbol = data.get('symbol')
        if not symbol:
            await sio.emit('error', {'message': '주식 심볼이 필요합니다.'}, room=sid)
            return
        
        await ws_manager.subscribe_to_stock(sid, symbol.upper())
    except Exception as e:
        logger.error(f"주식 구독 처리 오류: {e}")
        await sio.emit('error', {'message': '구독 처리 중 오류가 발생했습니다.'}, room=sid)


@sio.event
async def unsubscribe_stock(sid, data):
    """주식 데이터 구독 해제 요청 핸들러."""
    try:
        symbol = data.get('symbol')
        if not symbol:
            await sio.emit('error', {'message': '주식 심볼이 필요합니다.'}, room=sid)
            return
        
        await ws_manager.unsubscribe_from_stock(sid, symbol.upper())
    except Exception as e:
        logger.error(f"주식 구독 해제 처리 오류: {e}")
        await sio.emit('error', {'message': '구독 해제 처리 중 오류가 발생했습니다.'}, room=sid)


@sio.event
async def get_subscriptions(sid):
    """현재 구독 목록 요청 핸들러."""
    try:
        if sid in ws_manager.active_connections:
            subscriptions = ws_manager.active_connections[sid]['subscriptions']
            await sio.emit('current_subscriptions', {
                'subscriptions': subscriptions
            }, room=sid)
        else:
            await sio.emit('error', {'message': '연결 정보를 찾을 수 없습니다.'}, room=sid)
    except Exception as e:
        logger.error(f"구독 목록 조회 오류: {e}")
        await sio.emit('error', {'message': '구독 목록 조회 중 오류가 발생했습니다.'}, room=sid)


@sio.event
async def ping(sid, data):
    """핑/퐁 테스트용 핸들러."""
    await sio.emit('pong', {'message': 'pong', 'timestamp': asyncio.get_event_loop().time()}, room=sid)


def setup_websocket(app: FastAPI):
    """FastAPI 앱에 Socket.IO를 설정합니다."""
    # Socket.IO ASGI 앱 생성 (전체 앱을 래핑)
    socket_app = socketio.ASGIApp(sio, app)
    
    return socket_app


# 외부에서 사용할 수 있는 함수들
async def emit_stock_update(symbol: str, data: Dict[str, Any]) -> None:
    """주식 데이터 업데이트를 브로드캐스트."""
    await ws_manager.broadcast_stock_data(symbol, data)


async def emit_market_status(status: Dict[str, Any]) -> None:
    """시장 상태 업데이트를 브로드캐스트."""
    await ws_manager.broadcast_market_status(status)


def get_websocket_stats() -> Dict[str, Any]:
    """WebSocket 연결 통계를 반환."""
    return ws_manager.get_connection_stats()
