from fastapi import APIRouter
from app.routers.portfolios import router as portfolios_router

# API 메인 라우터
api_router = APIRouter()

# 포트폴리오 라우터 포함
api_router.include_router(portfolios_router, prefix="/portfolios", tags=["portfolios"])