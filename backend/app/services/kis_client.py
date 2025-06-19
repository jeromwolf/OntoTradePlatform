"""KIS(한국투자증권) API 클라이언트 서비스"""
import os
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class KISClient:
    """KIS(한국투자증권) Open API 클라이언트"""
    
    # 기본 설정
    BASE_URL = "https://openapi.koreainvestment.com:9443"  # 실전계좌
    # BASE_URL = "https://openapivts.koreainvestment.com:29443"  # 모의계좌
    
    def __init__(self):
        self.app_key = settings.KIS_APP_KEY
        self.app_secret = settings.KIS_APP_SECRET
        self.access_token: Optional[str] = None
        self.token_expires: Optional[datetime] = None
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_access_token(self, force_refresh: bool = False) -> str:
        """OAuth2 액세스 토큰 발급"""
        # 토큰이 있고, 만료되지 않았으며, 강제 갱신이 아닌 경우 기존 토큰 반환
        if not force_refresh and self.access_token and self.token_expires and datetime.now() < self.token_expires:
            return self.access_token
            
        # 토큰이 만료된 경우 60초 대기 (KIS API 요금제 제한 회피)
        if self.access_token and not force_refresh and self.token_expires and datetime.now() >= self.token_expires:
            wait_seconds = 60
            logger.warning(f"토큰이 만료되어 {wait_seconds}초 대기 후 갱신을 시도합니다.")
            await asyncio.sleep(wait_seconds)
        
        url = f"{self.BASE_URL}/oauth2/tokenP"
        headers = {"content-type": "application/json"}
        body = {
            "grant_type": "client_credentials",
            "appkey": self.app_key,
            "appsecret": self.app_secret
        }
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, headers=headers, json=body) as response:
                        if response.status == 200:
                            data = await response.json()
                            self.access_token = data.get('access_token')
                            self.token_expires = datetime.now() + timedelta(seconds=3600)  # 1시간 후 만료
                            logger.info("KIS API 액세스 토큰 발급 성공")
                            return self.access_token
                        else:
                            error_text = await response.text()
                            logger.error(f"KIS API 토큰 발급 실패 (시도 {attempt + 1}/{max_retries}): {error_text}")
                            
            except Exception as e:
                logger.error(f"KIS API 연결 오류 (시도 {attempt + 1}/{max_retries}): {str(e)}", exc_info=True)
                
            if attempt < max_retries - 1:
                await asyncio.sleep(1)  # 재시도 전 1초 대기
        
        raise Exception("KIS API 토큰 발급에 실패했습니다.")
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        headers: Optional[Dict[str, str]] = None, 
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        retry: bool = True
    ) -> Dict[str, Any]:
        """KIS API에 요청을 보내는 내부 메서드"""
        if not self.session:
            self.session = aiohttp.ClientSession()
            
        # 기본 헤더 설정
        request_headers = {
            "Content-Type": "application/json",
            "authorization": f"Bearer {await self.get_access_token()}",
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": "CTCA0903M",  # 기본 트랜잭션 ID (실제로는 엔드포인트별로 다름)
            "custtype": "P",  # 개인고객
        }
        
        if headers:
            request_headers.update(headers)
        
        url = f"{self.BASE_URL}{endpoint}"
        
        try:
            async with self.session.request(
                method, url, headers=request_headers, params=params, json=data
            ) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 401 and retry:  # 토큰 만료 시 한 번 재시도
                    logger.warning("토큰이 만료되어 갱신 후 재시도합니다.")
                    self.access_token = None  # 토큰 초기화
                    return await self._make_request(method, endpoint, headers, params, data, False)
                else:
                    error_text = await response.text()
                    logger.error(f"KIS API 요청 실패 ({response.status}): {error_text}")
                    raise Exception(f"KIS API 요청 실패 ({response.status}): {error_text}")
                    
        except Exception as e:
            logger.error(f"KIS API 요청 중 오류 발생: {str(e)}", exc_info=True)
            raise
    
    # 국내주식 현재가 조회
    async def get_korean_stock_quote(self, symbol: str) -> Dict[str, Any]:
        """국내주식 현재가 조회"""
        endpoint = f"/uapi/domestic-stock/v1/quotations/inquire-price"
        params = {"fid_cond_mrkt_div_code": "J", "fid_input_iscd": symbol}
        
        # 트레이딩 용도에 맞는 tr_id 설정
        headers = {"tr_id": "FHKST01010100"}  # 주식현재가 시세
        
        return await self._make_request("GET", endpoint, headers=headers, params=params)
    
    # 해외주식 현재가 조회
    async def get_overseas_stock_quote(self, symbol: str, exchange: str = "NASD") -> Dict[str, Any]:
        """해외주식 현재가 조회"""
        endpoint = f"/uapi/overseas-price/v1/quotations/price"
        params = {
            "AUTH": "",
            "EXCD": exchange,  # NASD: 나스닥, NYSE: 뉴욕, AMEX: 아멕스, SEHK: 홍콩, TSE: 도쿄
            "SYMB": symbol
        }
        
        headers = {"tr_id": "HHDFS00000300"}  # 해외주식 현재가 조회
        
        return await self._make_request("GET", endpoint, headers=headers, params=params)
    
    # 국내주식 주문
    async def place_korean_order(
        self, 
        account_number: str,  # 계좌번호
        account_product_code: str,  # 계좌상품코드
        order_type: str,  # 주문유형 (00: 지정가, 01: 시장가, ...)
        order_quantity: int,  # 주문수량
        order_price: float,  # 주문가격 (시장가 주문 시 0)
        symbol: str,  # 종목코드
        side: str = "01"  # 01: 매도, 02: 매수
    ) -> Dict[str, Any]:
        """국내주식 주문 실행"""
        endpoint = "/uapi/domestic-stock/v1/trading/order-cash"
        
        # 주문요청 파라미터
        body = {
            "CANO": account_number[:8],  # 계좌번호 앞 8자리
            "ACNT_PRDT_CD": account_product_code,  # 계좌상품코드 (뒷 2자리)
            "PDNO": symbol,  # 종목코드
            "ORD_DVSN": order_type,  # 주문구분 (00: 지정가, 01: 시장가, ...)
            "ORD_QTY": str(order_quantity),  # 주문수량
            "ORD_UNPR": str(order_price),  # 주문단가 (시장가 주문 시 "0")
            "SLL_TYPE": "01",  # 매도/매수구분 (01: 매도, 02: 매수)
            "ALGO_NO": "",  # 조건부주문일 경우 알고리즘 번호
        }
        
        headers = {
            "tr_id": "TTTC0802U",  # 주식 현금 매수 주문
            "custtype": "P"  # 개인고객
        }
        
        return await self._make_request("POST", endpoint, headers=headers, data=body)
    
    # 국내주식 잔고 조회
    async def get_korean_portfolio(self) -> Dict[str, Any]:
        """국내주식 잔고 조회"""
        endpoint = "/uapi/domestic-stock/v1/trading/inquire-balance"
        
        # 여기서는 예시로 계좌번호를 환경변수에서 가져옵니다.
        # 실제 구현에서는 사용자별로 다른 계좌를 사용할 수 있도록 수정이 필요합니다.
        account_number = os.getenv("KIS_ACCOUNT_NUMBER", "")
        
        params = {
            "CANO": account_number[:8],  # 계좌번호 앞 8자리
            "ACNT_PRDT_CD": account_number[8:],  # 계좌번호 뒤 2자리
            "AFHR_FLPR_YN": "N",  # 시간외단일가여부
            "OFL_YN": "",  # 오프라인여부
            "INQR_DVSN": "01",  # 조회구분 (01: 대출일, 02: 종목별, 03: 종목별합산)
            "UNPR_DVSN": "01",  # 단가구분
            "FUND_STTL_ICLD_YN": "N",  # 펀드결제분포함여부
            "FNCG_AMT_AUTO_RDPT_YN": "N",  # 융자금액자동상환여부
            "PRCS_DVSN": "00",  # 처리구분 (00: 전일매매, 01: 당일매매)
            "CTX_AREA_FK100": "",  # 연속조회검색조건
            "CTX_AREA_NK100": ""  # 연속조회키
        }
        
        headers = {
            "tr_id": "TTTC8434R",  # 주식잔고조회
            "custtype": "P"  # 개인고객
        }
        
        return await self._make_request("GET", endpoint, headers=headers, params=params)

    # 범용 주문 메서드 (기존 메서드와의 호환성을 위해 유지)
    async def place_order(self, order_data: Dict[str, Any], is_overseas: bool = False) -> Dict[str, Any]:
        """주문 실행 (기존 코드와의 호환성을 위한 래퍼 메서드)"""
        if is_overseas:
            # 해외주식 주문 로직 (구현 필요)
            raise NotImplementedError("해외주식 주문은 아직 구현되지 않았습니다.")
        else:
            # 국내주식 주문
            required_fields = ["PDNO", "ORD_DVSN", "ORD_QTY", "ORD_UNPR"]
            for field in required_fields:
                if field not in order_data:
                    raise ValueError(f"주문에 필요한 필드가 없습니다: {field}")
                    
            # 여기서는 간단히 예시로 구현합니다.
            # 실제로는 계좌 정보 등을 추가로 처리해야 합니다.
            return await self.place_korean_order(
                account_number=os.getenv("KIS_ACCOUNT_NUMBER", ""),
                account_product_code=os.getenv("KIS_ACCOUNT_PRODUCT_CODE", ""),
                order_type=order_data["ORD_DVSN"],
                order_quantity=int(order_data["ORD_QTY"]),
                order_price=float(order_data["ORD_UNPR"] or 0),
                symbol=order_data["PDNO"],
                side=order_data.get("SLL_TYPE", "02")  # 기본값: 매수
            )
