"""간단한 WebSocket 서버 구현 (FastAPI 내장 WebSocket 사용)."""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Set

import socketio
from socketio import AsyncServer

from app.core.error_recovery import circuit_breaker, recovery_system
from app.core.logging_system import (
    ErrorCategory,
    ErrorSeverity,
    log_critical,
    log_error,
    log_info,
    log_websocket_event,
    logging_system,
)
from app.core.monitoring import add_breadcrumb, capture_message
from app.services.data_normalizer import data_normalizer
from app.services.data_validator import DataSource
from app.services.stock_simulator import StockDataSimulator

# 기존 logging 설정 제거하고 새로운 시스템 사용
# logger = logging.getLogger(__name__)


class WebsocketManager:
    def __init__(self):
        # Socket.IO 서버 생성 (ASGI 호환 설정)
        self.sio = AsyncServer(
            cors_allowed_origins="*",
            logger=False,  # 기본 로거 비활성화
            engineio_logger=False,
            async_mode="asgi",  # ASGI 모드 명시적 지정
        )

        # 구독 관리
        self.subscriptions: Dict[str, Set[str]] = {}  # symbol -> set of session_ids
        self.session_symbols: Dict[str, Set[str]] = {}  # session_id -> set of symbols

        # 주식 시뮬레이터
        self.stock_simulator = StockDataSimulator()

        # 이벤트 핸들러 등록
        self._register_events()

        # 자동 업데이트 태스크
        self.update_task = None

        log_info("WebSocket 관리자 초기화 완료")

    def _register_events(self):
        """Socket.IO 이벤트 핸들러 등록"""

        @self.sio.event
        async def connect(sid, environ):
            """클라이언트 연결"""
            try:
                client_info = {
                    "session_id": sid,
                    "user_agent": environ.get("HTTP_USER_AGENT", "Unknown"),
                    "remote_addr": environ.get("REMOTE_ADDR", "Unknown"),
                }

                log_info(
                    f"WebSocket 클라이언트 연결: {sid}",
                    context=client_info,
                )

                add_breadcrumb(
                    message="WebSocket 클라이언트 연결",
                    category="websocket",
                    data=client_info,
                )

                self.session_symbols[sid] = set()
                await self.sio.emit(
                    "connected", {"status": "success", "session_id": sid}, room=sid
                )

            except Exception as e:
                log_error(
                    f"클라이언트 연결 처리 중 오류: {e}",
                )

        @self.sio.event
        async def disconnect(sid):
            """클라이언트 연결 해제"""
            try:
                # 구독 정리
                if sid in self.session_symbols:
                    symbols_to_remove = self.session_symbols[sid].copy()
                    for symbol in symbols_to_remove:
                        await self._unsubscribe_symbol(sid, symbol)
                    del self.session_symbols[sid]

                log_websocket_event("client_disconnected")

            except Exception as e:
                log_error(
                    f"클라이언트 연결 해제 처리 중 오류: {e}",
                    category=ErrorCategory.WEBSOCKET_ERROR,
                    severity=ErrorSeverity.LOW,
                )

        @self.sio.event
        async def subscribe(sid, data):
            """종목 구독"""
            try:
                symbol = data.get("symbol", "").upper().strip()
                if not symbol:
                    await self.sio.emit(
                        "error",
                        {"message": "종목 코드가 필요합니다", "code": "MISSING_SYMBOL"},
                        room=sid,
                    )
                    return

                # 서킷 브레이커를 통한 보호된 구독
                async with circuit_breaker("websocket") as protected_call:
                    await protected_call(self._subscribe_symbol, sid, symbol)

                log_websocket_event("symbol_subscribed")

            except Exception as e:
                log_error(
                    f"종목 구독 중 오류: {e}",
                    category=ErrorCategory.WEBSOCKET_ERROR,
                    severity=ErrorSeverity.MEDIUM,
                )

                await self.sio.emit(
                    "error",
                    {"message": f"구독 실패: {str(e)}", "code": "SUBSCRIPTION_ERROR"},
                    room=sid,
                )

        @self.sio.event
        async def unsubscribe(sid, data):
            """종목 구독 해제"""
            try:
                symbol = data.get("symbol", "").upper().strip()
                if not symbol:
                    await self.sio.emit(
                        "error",
                        {"message": "종목 코드가 필요합니다", "code": "MISSING_SYMBOL"},
                        room=sid,
                    )
                    return

                await self._unsubscribe_symbol(sid, symbol)

                log_websocket_event("symbol_unsubscribed")

            except Exception as e:
                log_error(
                    f"종목 구독 해제 중 오류: {e}",
                    category=ErrorCategory.WEBSOCKET_ERROR,
                    severity=ErrorSeverity.LOW,
                )

        @self.sio.event
        async def get_subscriptions(sid, data):
            """현재 구독 목록 조회"""
            try:
                symbols = list(self.session_symbols.get(sid, set()))
                await self.sio.emit(
                    "subscriptions",
                    {"symbols": symbols, "count": len(symbols)},
                    room=sid,
                )

                log_websocket_event("subscriptions_requested")

            except Exception as e:
                log_error(
                    f"구독 목록 조회 중 오류: {e}",
                    category=ErrorCategory.WEBSOCKET_ERROR,
                    severity=ErrorSeverity.LOW,
                )

        @self.sio.event
        async def get_data_quality(sid, data):
            """데이터 품질 정보 조회"""
            try:
                quality_report = data_normalizer.get_quality_report()
                await self.sio.emit("data_quality", quality_report, room=sid)

                log_websocket_event("data_quality_requested")

            except Exception as e:
                log_error(
                    f"데이터 품질 조회 중 오류: {e}",
                    category=ErrorCategory.DATA_VALIDATION_ERROR,
                    severity=ErrorSeverity.MEDIUM,
                )

    async def _subscribe_symbol(self, sid: str, symbol: str):
        """종목 구독 처리"""
        # 구독 정보 업데이트
        if symbol not in self.subscriptions:
            self.subscriptions[symbol] = set()
        self.subscriptions[symbol].add(sid)
        self.session_symbols[sid].add(symbol)

        # 초기 데이터 전송
        try:
            async with logging_system.performance_monitor("stock_data_fetch"):
                stock_data = self.stock_simulator.get_real_time_data(symbol)

                # 데이터 정규화 및 검증
                validation_result = data_normalizer.normalize_and_validate(
                    symbol, stock_data, DataSource.MOCK
                )
                normalized_data = (
                    validation_result.normalized_data
                    if validation_result.is_valid
                    else stock_data
                )

                await self.sio.emit(
                    "stock_data",
                    {
                        "symbol": symbol,
                        "data": normalized_data,
                        "timestamp": datetime.now().isoformat(),
                        "quality_score": normalized_data.get("quality_score", 0),
                    },
                    room=sid,
                )

        except Exception as e:
            log_error(
                f"초기 데이터 전송 실패: {symbol}",
                category=ErrorCategory.DATA_VALIDATION_ERROR,
                severity=ErrorSeverity.MEDIUM,
            )
            raise

        await self.sio.emit(
            "subscribed", {"symbol": symbol, "status": "success"}, room=sid
        )

    async def _unsubscribe_symbol(self, sid: str, symbol: str):
        """종목 구독 해제 처리"""
        # 구독 정보 제거
        if symbol in self.subscriptions and sid in self.subscriptions[symbol]:
            self.subscriptions[symbol].remove(sid)
            if not self.subscriptions[symbol]:
                del self.subscriptions[symbol]

        if sid in self.session_symbols and symbol in self.session_symbols[sid]:
            self.session_symbols[sid].remove(symbol)

        await self.sio.emit(
            "unsubscribed", {"symbol": symbol, "status": "success"}, room=sid
        )

    async def start_auto_updates(self):
        """자동 업데이트 시작"""
        if self.update_task is None or self.update_task.done():
            self.update_task = asyncio.create_task(self._auto_update_loop())
            log_info("WebSocket 자동 업데이트 시작")

    async def _auto_update_loop(self):
        """자동 업데이트 루프"""
        while True:
            try:
                # 구독된 모든 종목에 대해 업데이트
                for symbol in list(self.subscriptions.keys()):
                    if symbol in self.subscriptions and self.subscriptions[symbol]:
                        try:
                            async with logging_system.performance_monitor(
                                f"auto_update_{symbol}"
                            ):
                                await self._send_stock_update(symbol)
                        except Exception as e:
                            log_error(
                                f"종목 업데이트 실패: {symbol}",
                                category=ErrorCategory.WEBSOCKET_ERROR,
                                severity=ErrorSeverity.MEDIUM,
                            )

                await asyncio.sleep(3)  # 3초마다 업데이트

            except Exception as e:
                log_error(
                    f"자동 업데이트 루프 오류: {e}",
                    category=ErrorCategory.WEBSOCKET_ERROR,
                    severity=ErrorSeverity.HIGH,
                )
                await asyncio.sleep(5)  # 오류 시 5초 대기

    async def _send_stock_update(self, symbol: str):
        """종목 업데이트 전송"""
        try:
            # 주식 데이터 가져오기 (안전하게 처리)
            stock_data = self.stock_simulator.get_real_time_data(symbol)

            # 데이터 정규화 및 검증
            validation_result = data_normalizer.normalize_and_validate(
                symbol, stock_data, DataSource.MOCK
            )
            normalized_data = (
                validation_result.normalized_data
                if validation_result.is_valid
                else stock_data
            )

            # 이상치 탐지 결과 확인
            anomalies = normalized_data.get("anomalies", [])
            if anomalies:
                log_warning(
                    f"이상치 탐지: {symbol}",
                    category=ErrorCategory.DATA_VALIDATION_ERROR,
                    severity=ErrorSeverity.MEDIUM,
                )

            # 구독자들에게 데이터 전송
            if symbol in self.subscriptions:
                session_ids = list(self.subscriptions[symbol])
                for sid in session_ids:
                    try:
                        await self.sio.emit(
                            "stock_data",
                            {
                                "symbol": symbol,
                                "data": normalized_data,
                                "timestamp": datetime.now().isoformat(),
                                "quality_score": normalized_data.get(
                                    "quality_score", 0
                                ),
                            },
                            room=sid,
                        )
                    except Exception as e:
                        log_error(
                            f"클라이언트 업데이트 전송 실패: {sid}",
                            category=ErrorCategory.WEBSOCKET_ERROR,
                            severity=ErrorSeverity.LOW,
                        )

        except Exception as e:
            log_error(
                f"종목 업데이트 생성 실패: {symbol}",
                category=ErrorCategory.WEBSOCKET_ERROR,
                severity=ErrorSeverity.MEDIUM,
            )
            # 개별 종목 실패가 전체 시스템을 멈추지 않도록 예외를 다시 던지지 않음

    async def stop_auto_updates(self):
        """자동 업데이트 중지"""
        if self.update_task and not self.update_task.done():
            self.update_task.cancel()
            try:
                await self.update_task
            except asyncio.CancelledError:
                pass
            log_info("WebSocket 자동 업데이트 중지")

    def get_stats(self) -> dict:
        """WebSocket 통계 정보"""
        total_subscriptions = sum(
            len(sessions) for sessions in self.subscriptions.values()
        )
        active_sessions = len(self.session_symbols)
        active_symbols = len(self.subscriptions)

        stats = {
            "active_sessions": active_sessions,
            "active_symbols": active_symbols,
            "total_subscriptions": total_subscriptions,
            "symbols": list(self.subscriptions.keys()),
            "update_task_running": self.update_task is not None
            and not self.update_task.done(),
        }

        log_info("WebSocket 통계 조회")

        return stats


# 전역 WebSocket 관리자 인스턴스
websocket_manager = WebsocketManager()


def get_websocket_stats():
    """WebSocket 통계 정보를 반환하는 함수"""
    return websocket_manager.get_stats()


# Socket.IO ASGI 앱 생성
sio_asgi_app = socketio.ASGIApp(websocket_manager.sio)


# WebSocket 자동 시작 함수
async def start_websocket_updates():
    """WebSocket 자동 업데이트 시작"""
    await websocket_manager.start_auto_updates()
    log_info("WebSocket 자동 업데이트 시작됨")


# Socket.IO 앱을 얻는 함수
def get_socket_app():
    """Socket.IO ASGI 앱을 반환"""
    return sio_asgi_app


# WebSocket 관련 FastAPI 라우트들
from fastapi import APIRouter

ws_router = APIRouter()


@ws_router.get("/ws/stats")
async def websocket_stats():
    """WebSocket 통계 API 엔드포인트"""
    return websocket_manager.get_stats()
