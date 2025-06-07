"""OntoTrade 백엔드 메인 애플리케이션 모듈."""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.monitoring import init_sentry


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

    # API 라우터 등록
    app.include_router(api_router, prefix="/api/v1")

    return app


def configure_cors(app: FastAPI) -> None:
    """CORS 설정을 구성합니다."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def configure_routes(app: FastAPI) -> None:
    """라우트를 구성합니다."""
    app.include_router(api_router, prefix="/api/v1")


# FastAPI 앱 인스턴스 생성
app = create_app()


@app.get("/")
async def root():
    """루트 엔드포인트를 제공합니다."""
    return JSONResponse(
        {
            "message": "OntoTrade API에 오신 것을 환영합니다! ",
            "status": "healthy",
            "version": settings.VERSION,
            "docs": "/docs",
            "description": "온톨로지 기반 투자 시뮬레이션 플랫폼",
        }
    )


@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트를 제공합니다."""
    return JSONResponse({"status": "healthy", "version": settings.VERSION})


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",  # 보안상 localhost로 변경
        port=8000,
        reload=True,
        log_level="info",
    )
