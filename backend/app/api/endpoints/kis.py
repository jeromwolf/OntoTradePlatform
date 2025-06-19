from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any, Optional
import logging

from app.services.kis_client import KISClient
from app.core.config import settings
from app.api.deps import get_current_active_user
from app.schemas.user import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
logger = logging.getLogger(__name__)

# KIS 클라이언트 인스턴스 생성
def get_kis_client() -> KISClient:
    return KISClient()

@router.get("/stocks/{symbol}", response_model=Dict[str, Any])
async def get_stock_quote(
    symbol: str,
    kis_client: KISClient = Depends(get_kis_client),
    current_user: User = Depends(get_current_active_user)
):
    """
    주식 시세 조회
    - symbol: 종목코드 (예: 005930)
    """
    try:
        # 국내주식인지 해외주식인지 판단 (간단히 길이로 구분)
        is_overseas = len(symbol) > 6  # 실제로는 더 정교한 검증 필요
        
        if is_overseas:
            quote = await kis_client.get_overseas_stock_quote(symbol)
        else:
            quote = await kis_client.get_korean_stock_quote(symbol)
            
        return {"success": True, "data": quote}
        
    except Exception as e:
        logger.error(f"주식 시세 조회 중 오류 발생: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"주식 시세를 가져오는 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/orders", response_model=Dict[str, Any])
async def place_order(
    order_data: Dict[str, Any],
    kis_client: KISClient = Depends(get_kis_client),
    current_user: User = Depends(get_current_active_user)
):
    """
    주문 실행
    - order_data: 주문 정보 (PDNO, ORD_DVSN, ORD_QTY, ORD_UNPR 등)
    """
    try:
        # 주문 실행
        result = await kis_client.place_order(order_data)
        return {"success": True, "data": result}
        
    except Exception as e:
        logger.error(f"주문 실행 중 오류 발생: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"주문을 실행하는 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/portfolio", response_model=Dict[str, Any])
async def get_portfolio(
    kis_client: KISClient = Depends(get_kis_client),
    current_user: User = Depends(get_current_active_user)
):
    """
    포트폴리오 조회
    """
    try:
        # 국내 포트폴리오 조회
        korean_portfolio = await kis_client.get_korean_portfolio()
        
        # 해외 포트폴리오 조회 (필요시)
        # overseas_portfolio = await kis_client.get_overseas_portfolio()
        
        return {
            "success": True, 
            "data": {
                "korean": korean_portfolio,
                # "overseas": overseas_portfolio
            }
        }
        
    except Exception as e:
        logger.error(f"포트폴리오 조회 중 오류 발생: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"포트폴리오를 조회하는 중 오류가 발생했습니다: {str(e)}"
        )
