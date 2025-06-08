from fastapi import APIRouter

from app.api.endpoints import auth, health, portfolios, stocks, users, websocket
from app.routers.portfolios import router as portfolio_router

# 메인 API 라우터
api_router = APIRouter()

# 각 모듈별 라우터 포함
api_router.include_router(health.router, prefix="/health", tags=["health"])

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

api_router.include_router(users.router, prefix="/users", tags=["users"])

api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])

api_router.include_router(portfolio_router, prefix="/portfolios", tags=["portfolios"])

api_router.include_router(websocket.router, tags=["WebSocket"])
