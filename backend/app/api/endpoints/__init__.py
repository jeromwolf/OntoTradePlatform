from fastapi import APIRouter

from app.api.endpoints import auth, users, portfolios, trading

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["인증"])
api_router.include_router(users.router, prefix="/users", tags=["사용자"])
api_router.include_router(portfolios.router, prefix="/portfolios", tags=["포트폴리오"])
api_router.include_router(trading.router, prefix="/trading", tags=["거래"])