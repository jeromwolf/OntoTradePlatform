"""OntoTrade 백엔드 메인 애플리케이션 모듈."""

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import socketio

from app.core.config import settings
from app.core.monitoring import init_sentry
from app.core.websocket_simple import websocket_manager, start_websocket_updates, ws_router
from app.api.endpoints import portfolios, portfolio_holdings


def create_app() -> FastAPI:
    """애플리케이션 인스턴스를 생성합니다."""
    # 모니터링 초기화
    init_sentry()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="OntoTrade - 온톨로지 기반 투자 시뮬레이션 플랫폼",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS 미들웨어 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


# FastAPI 앱 인스턴스 생성
app = create_app()

# 앱 시작 시 WebSocket 업데이트 시작
@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행되는 이벤트"""
    await start_websocket_updates()


@app.get("/")
async def root():
    """루트 엔드포인트를 제공합니다."""
    return JSONResponse(
        {
            "message": "OntoTrade API에 오신 것을 환영합니다! ",
            "status": "healthy",
            "version": "1.0.0",
            "docs": "/docs",
            "description": "온톨로지 기반 투자 시뮬레이션 플랫폼",
            "websocket": "/socket.io",
        }
    )


@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트를 제공합니다."""
    return JSONResponse({"status": "healthy", "version": settings.VERSION})


@app.get("/websocket/stats")
async def websocket_stats():
    """WebSocket 연결 통계를 제공합니다."""
    stats = websocket_manager.get_stats()
    return JSONResponse({"status": "success", "data": stats})


# WebSocket 라우터 포함
app.include_router(ws_router)

# 포트폴리오 API 라우터 포함
app.include_router(portfolios.router, prefix="/api/portfolios", tags=["portfolios"])
app.include_router(portfolio_holdings.router, prefix="/api/portfolios", tags=["portfolio-holdings"])

# Socket.IO와 FastAPI를 결합한 ASGI 앱 생성
socket_app = socketio.ASGIApp(websocket_manager.sio, app, socketio_path='/socket.io')

if __name__ == "__main__":
    uvicorn.run(
        "app.main:socket_app",  # Socket.IO 통합 앱 사용
        host="127.0.0.1",  # 보안상 localhost로 변경
        port=8000,
        reload=True,
        log_level="info",
    )
