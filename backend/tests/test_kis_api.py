import os
import asyncio
import aiohttp
import json
import pytest
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from unittest.mock import patch, MagicMock, AsyncMock

# 환경 변수 로드
load_dotenv()

class KISClient:
    BASE_URL = "https://openapivts.koreainvestment.com:29443"
    
    def __init__(self):
        self.app_key = os.getenv("KIS_APP_KEY")
        self.app_secret = os.getenv("KIS_APP_SECRET")
        self.access_token = None
        self.token_expires = None
    
    async def get_access_token(self, force_refresh=False):
        # 강제 갱신이 아니고, 토큰이 아직 유효하면 기존 토큰 반환
        if not force_refresh and self.access_token and self.token_expires and datetime.now() < self.token_expires:
            return self.access_token
            
        # 토큰이 있지만 만료된 경우에는 1분 대기 (API 제한 회피)
        if self.access_token and not force_refresh and self.token_expires and datetime.now() >= self.token_expires:
            wait_seconds = 60  # 1분 대기
            print(f"⚠️ 토큰이 만료되었습니다. {wait_seconds}초 후에 갱신을 시도합니다...")
            await asyncio.sleep(wait_seconds)
            
        # 새 토큰 발급
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
                            # 토큰 만료 시간 설정 (실제로는 expires_in 값 사용)
                            self.token_expires = datetime.now() + timedelta(seconds=3600)
                            print(f"✅ 토큰 발급 성공 (시도: {attempt + 1})")
                            return self.access_token
                        else:
                            error = await response.text()
                            print(f"❌ 토큰 발급 실패 (시도: {attempt + 1}): {response.status}")
                            print(f"에러 메시지: {error}")
                            
                            # 403 오류인 경우 일정 시간 대기 후 재시도
                            if response.status == 403 and attempt < max_retries - 1:
                                wait_time = 60 * (attempt + 1)  # 1분, 2분, 3분 대기
                                print(f"⚠️ {wait_time}초 후에 재시도합니다...")
                                await asyncio.sleep(wait_time)
                                continue
                                
                            return None
            except Exception as e:
                print(f"❌ 토큰 발급 중 오류 (시도: {attempt + 1}): {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(5)  # 간단한 오류의 경우 5초 대기 후 재시도
                    continue
                return None
    
    async def get_overseas_stock_info(self, symbol: str, exchange: str = "NAS"):
        """
        해외주식 상세 정보 조회 (KIS API v2 사용)
        :param symbol: 종목 심볼 (예: AAPL, TSLA)
        :param exchange: 거래소 코드 (NAS: 나스닥, NYS: 뉴욕, AMS: 아멕스, TSE: 도쿄, HKS: 홍콩, SHS: 상해, SZS: 심천)
        :return: 해외주식 상세 정보
        """
        token = await self.get_access_token()
        if not token:
            return None
        
        # KIS 해외주식 API v2 엔드포인트 사용
        url = f"{self.BASE_URL}/uapi/overseas-price/v1/quotations/price"
        
        # 헤더 설정 (KIS API v2 형식)
        headers = {
            "authorization": f"Bearer {token}",
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": "HHDFS00000300",  # 해외주식 현재가 조회
            "custtype": "P",            # 개인고객
            "content-type": "application/json; charset=utf-8"
        }
        
        # 파라미터 설정 (KIS API v2 형식)
        params = {
            "AUTH": "",
            "EXCD": exchange,  # 거래소 코드
            "SYMB": symbol,    # 종목 심볼
            "GUBN": "0",       # 0: 정규장, 1: 시간외
            "BYMD": "",        # 조회일자 (YYYYMMDD, 공란: 당일)
            "MODP": "1"        # 0: 수정주가, 1: 원주가
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                # 1. 현재가 정보 조회
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status != 200:
                        error = await response.text()
                        print(f"❌ 해외주식 현재가 조회 실패: {response.status}")
                        print(f"응답: {error}")
                        return None
                        
                    data = await response.json()
                    
                    # 2. 일별 시세 조회 (1일치)
                    daily_url = f"{self.BASE_URL}/uapi/overseas-price/v1/quotations/dailyprice"
                    daily_params = {
                        "AUTH": "",
                        "EXCD": exchange,
                        "SYMB": symbol,
                        "GUBN": "0",  # 0: 정규장, 1: 시간외
                        "BYMD": "",   # 조회 시작일 (공백: 전체)
                        "MODP": "1"   # 0: 수정주가, 1: 원주가
                    }
                    
                    async with session.get(daily_url, headers=headers, params=daily_params) as daily_response:
                        if daily_response.status == 200:
                            daily_data = await daily_response.json()
                            if 'output' in daily_data and daily_data['output']:
                                # 일별 시세 데이터가 있으면 병합
                                if 'output' in data and data['output']:
                                    data['daily'] = daily_data['output']
                    
                    # 3. 호가 정보 조회
                    quote_url = f"{self.BASE_URL}/uapi/overseas-price/v1/quotations/ccol"
                    quote_params = {
                        "AUTH": "",
                        "EXCD": exchange,
                        "SYMB": symbol
                    }
                    
                    async with session.get(quote_url, headers=headers, params=quote_params) as quote_response:
                        if quote_response.status == 200:
                            quote_data = await quote_response.json()
                            if 'output' in quote_data and quote_data['output']:
                                # 호가 정보가 있으면 병합
                                if 'output' in data and data['output']:
                                    data['quote'] = quote_data['output']
                    
                    return data
                    
        except aiohttp.ClientError as e:
            print(f"❌ HTTP 오류 발생: {str(e)}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ JSON 파싱 오류: {str(e)}")
            return None
        except Exception as e:
            print(f"❌ 해외주식 정보 조회 중 오류: {str(e)}")
            return None
            
    async def get_overseas_account_balance(self):
        """
        해외주식 계좌 잔고 조회
        :return: 계좌 잔고 정보
        """
        token = await self.get_access_token()
        if not token:
            return None
            
        url = f"{self.BASE_URL}/uapi/overseas-stock/v1/trading/inquire-balance"
        
        headers = {
            "authorization": f"Bearer {token}",
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": "CTRP6504R",  # 해외주식 잔고조회
            "custtype": "P",
            "content-type": "application/json; charset=utf-8"
        }
        
        params = {
            "CANO": self.account_prefix,  # 계좌번호 앞 8자리
            "ACNT_PRDT_CD": self.account_suffix,  # 계좌번호 뒤 2자리
            "OVRS_EXCG_CD": "NASD",  # 해외거래소코드 (NASD: 나스닥, NYSE: 뉴욕)
            "TR_CRCY_CD": "USD",  # 통화코드
            "CTX_AREA_FK200": "",  # 연속조회키
            "CTX_AREA_NK200": ""   # 연속조회키
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status != 200:
                        error = await response.text()
                        print(f"❌ 해외주식 계좌 잔고 조회 실패: {response.status}")
                        print(f"응답: {error}")
                        return None
                    
                    return await response.json()
        except Exception as e:
            print(f"❌ 해외주식 계좌 잔고 조회 중 오류: {str(e)}")
            return None
    
    async def order_overseas_stock(self, symbol: str, exchange: str, qty: int, price: float, 
                                  order_type: str = "00", side: str = "BUY"):
        """
        해외주식 주문 (현재가 주문)
        :param symbol: 종목 심볼 (예: AAPL)
        :param exchange: 거래소 코드 (NAS: 나스닥, NYS: 뉴욕 등)
        :param qty: 주문 수량
        :param price: 주문 가격 (시장가 주문 시 0)
        :param order_type: 주문 유형 (00: 지정가, 01: 시장가)
        :param side: 매수/매도 (BUY/SELL)
        :return: 주문 결과
        """
        token = await self.get_access_token()
        if not token:
            return None
            
        url = f"{self.BASE_URL}/uapi/overseas-stock/v1/trading/order"
        
        headers = {
            "authorization": f"Bearer {token}",
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": "JTTT1002U" if side.upper() == "BUY" else "JTTT1006U",  # 매수/매도에 따라 다른 TR_ID
            "custtype": "P",
            "content-type": "application/json; charset=utf-8"
        }
        
        # 주문 요청 데이터
        data = {
            "CANO": self.account_prefix,  # 계좌번호 앞 8자리
            "ACNT_PRDT_CD": self.account_suffix,  # 계좌번호 뒤 2자리
            "OVRS_EXCG_CD": exchange,  # 해외거래소코드
            "PDNO": symbol,  # 종목코드
            "ORD_QTY": str(qty),  # 주문수량
            "OVRS_ORD_UNPR": str(price),  # 주문단가 (시장가 주문 시 "0")
            "ORD_SVR_DVSN_CD": "0",  # 주문서버구분코드 (0: 기본)
            "ORD_DVSN": order_type,  # 주문구분 (00: 지정가, 01: 시장가)
            "ORD_DVSN_CD": order_type,  # 주문구분코드 (00: 지정가, 01: 시장가)
            "CTAC_TLNO": "",  # 연락전화번호
            "MGCO_APTM_ODNO": "",  # 약정번호
            "SLL_TYPE": "00",  # 매도매수구분 (00: 매도, 01: 매수)
            "KRX_FRCRD_USE_YN": "N",  # KRX 외화대용사용여부
            "ORGN_ODNO": "",  # 원주문번호
            "RT_CNDI_TP_CD": ""  # 주문조건구분 (공백: 기본)
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=data) as response:
                    if response.status != 200:
                        error = await response.text()
                        print(f"❌ 해외주식 주문 실패: {response.status}")
                        print(f"응답: {error}")
                        return None
                    
                    result = await response.json()
                    
                    # 주문 확인을 위한 조회
                    if 'output' in result and 'ODNO' in result['output']:
                        order_no = result['output']['ODNO']
                        print(f"✅ 주문 접수 완료 - 주문번호: {order_no}")
                        
                        # 주문 상세 조회
                        order_detail = await self.get_overseas_order_detail(order_no)
                        if order_detail:
                            result['order_detail'] = order_detail
                    
                    return result
        except Exception as e:
            print(f"❌ 해외주식 주문 중 오류: {str(e)}")
            return None
    
    async def get_overseas_order_detail(self, order_no: str):
        """
        해외주식 주문 상세 조회
        :param order_no: 주문번호
        :return: 주문 상세 정보
        """
        token = await self.get_access_token()
        if not token:
            return None
            
        url = f"{self.BASE_URL}/uapi/overseas-stock/v1/trading/order-detail"
        
        headers = {
            "authorization": f"Bearer {token}",
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": "JTTT3001R",  # 해외주식 주문내역조회
            "custtype": "P",
            "content-type": "application/json; charset=utf-8"
        }
        
        params = {
            "CANO": self.account_prefix,  # 계좌번호 앞 8자리
            "ACNT_PRDT_CD": self.account_suffix,  # 계좌번호 뒤 2자리
            "PDNO": "",  # 종목코드 (전체 조회 시 공백)
            "ORD_STRT_DT": (datetime.now() - timedelta(days=7)).strftime("%Y%m%d"),  # 조회시작일 (최근 1주일)
            "ORD_END_DT": datetime.now().strftime("%Y%m%d"),  # 조회종료일
            "SLL_BUY_DVSN_CD": "",  # 매도매수구분 (공백: 전체)
            "CCLD_NCCS_DVSN": "01",  # 체결미체결구분 (01: 전체, 02: 체결, 03: 미체결)
            "OVRS_EXCG_CD": "",  # 해외거래소코드 (공백: 전체)
            "SORT_SQN": "DS",  # 정렬순서 (DS: 최신순, AS: 과거순)
            "ORD_DT": "",  # 주문일자 (YYYYMMDD, 공백: 전체)
            "ODNO": order_no,  # 주문번호
            "CTX_AREA_FK200": "",  # 연속조회키
            "CTX_AREA_NK200": ""   # 연속조회키
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status != 200:
                        error = await response.text()
                        print(f"❌ 해외주식 주문 상세 조회 실패: {response.status}")
                        print(f"응답: {error}")
                        return None
                    
                    result = await response.json()
                    if 'output' in result and result['output']:
                        return result['output'][0]  # 가장 최근 주문 정보 반환
                    return None
        except Exception as e:
            print(f"❌ 해외주식 주문 상세 조회 중 오류: {str(e)}")
            return None
    
    async def get_stock_price(self, symbol: str, is_overseas: bool = False, exchange: str = "NAS"):
        """
        주식 현재가 조회 (기존 메서드와 호환성 유지)
        :param symbol: 종목코드 (국내: 6자리, 해외: 티커 심볼)
        :param is_overseas: 해외주식 여부 (True: 해외, False: 국내)
        :param exchange: 해외주식인 경우 거래소 코드 (NAS, NYS 등)
        """
        if is_overseas:
            return await self.get_overseas_stock_info(symbol, exchange)
            
        # 기존 국내주식 조회 로직
        token = await self.get_access_token()
        if not token:
            return None
        else:
            # 국내주식 현재가 조회
            url = f"{self.BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price"
            headers = {
                "Authorization": f"Bearer {token}",
                "appkey": self.app_key,
                "appsecret": self.app_secret,
                "tr_id": "FHKST01010100",  # 주식현재가 시세
                "content-type": "application/json"
            }
            params = {
                "fid_cond_mrkt_div_code": "J",  # 주식, ETF, ETN
                "fid_input_iscd": symbol  # 종목코드
            }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        error = await response.text()
                        print(f"❌ {'해외' if is_overseas else '국내'}주식 조회 실패: {response.status}")
                        print(f"에러 메시지: {error}")
                        return None
        except Exception as e:
            print(f"❌ {'해외' if is_overseas else '국내'}주식 조회 중 오류: {str(e)}")
            return None

async def test_korean_stock():
    """국내주식(삼성전자) 현재가 조회 테스트"""
    kis = KISClient()
    symbol = "005930"  # 삼성전자
    
    print(f"\n🔍 국내주식 {symbol} 현재가 조회 중...")
    result = await kis.get_stock_price(symbol, is_overseas=False)
    
    if result and 'output' in result:
        stock = result['output']
        print("\n📈 국내주식 정보:")
        print(f"종목명: {stock.get('hts_kor_isnm')}")
        print(f"현재가: {stock.get('stck_prpr')}원")
        print(f"전일대비: {stock.get('prdy_vrss')}원 ({stock.get('prdy_ctrt')}%)")
        print(f"시가: {stock.get('stck_oprc')}원")
        print(f"고가: {stock.get('stck_hgpr')}원")
        print(f"저가: {stock.get('stck_lwpr')}원")
        print(f"거래량: {int(stock.get('acml_vol', 0)):,}주")
    else:
        print("❌ 국내주식 정보를 가져오는데 실패했습니다.")
        if result:
            print(f"응답: {json.dumps(result, ensure_ascii=False, indent=2)}")

async def test_overseas_trading():
    """해외주식 거래 테스트 (잔고 조회, 지정가/시장가 주문)"""
    kis = KISClient()
    
    # 1. 계좌 잔고 조회
    print("\n💳 해외주식 계좌 잔고 조회 중...")
    balance = await kis.get_overseas_account_balance()
    
    if balance and 'output1' in balance and balance['output1']:
        account = balance['output1'][0]
        print(f"\n💰 계좌 정보:")
        print(f"   계좌번호: {account.get('CANO')}-{account.get('ACNT_PRDT_CD')}")
        print(f"   예수금: ${float(account.get('D2_AFT_BFEX_AMT', 0)):,.2f}")
        print(f"   평가금액: ${float(account.get('TOT_EVAL_AMT', 0)):,.2f}")
        print(f"   평가손익: ${float(account.get('EVLU_PFLS_AMT', 0)):,.2f} ({float(account.get('EVLU_PFLS_RT', 0))}%)")
        
        # 보유 종목이 있는 경우 출력
        if 'output2' in balance and balance['output2']:
            print("\n📊 보유 종목:")
            for stock in balance['output2']:
                print(f"\n   종목: {stock.get('OVRS_ITEM_NAME')} ({stock.get('OVRS_PDNO')})")
                print(f"   보유수량: {int(stock.get('OVRS_CBLD_QTY', 0)):,}주")
                print(f"   매입가: ${float(stock.get('PUR_BAS1_AVG_PRC', 0)):,.2f}")
                print(f"   현재가: ${float(stock.get('OVRS_STCK_AVAL_STL_AMT', 0)):,.2f}")
                print(f"   평가손익: ${float(stock.get('EVLU_PFLS_AMT', 0)):,.2f} ({float(stock.get('EVLU_PFLS_RT', 0))}%)")
    else:
        print("❌ 계좌 잔고 조회에 실패했습니다.")
        if balance:
            print(f"응답: {json.dumps(balance, ensure_ascii=False, indent=2)}")
    
    # 2. 애플(AAPL) 주가 조회 (주문 전 현재가 확인용)
    print("\n📈 애플(AAPL) 현재가 조회 중...")
    aapl_info = await kis.get_overseas_stock_info("AAPL", "NAS")
    
    if aapl_info and 'output' in aapl_info and aapl_info['output']:
        aapl_price = float(aapl_info['output'].get('last', 0))
        print(f"   현재가: ${aapl_price:.2f}")
        
        # 3. 지정가 매수 주문 (현재가보다 5% 낮은 가격으로 1주 주문)
        limit_price = round(aapl_price * 0.95, 2)  # 현재가 대비 5% 낮은 가격
        print(f"\n💵 지정가 매수 주문 시도: AAPL 1주 x ${limit_price:.2f}")
        
        buy_order = await kis.order_overseas_stock(
            symbol="AAPL",
            exchange="NAS",
            qty=1,
            price=limit_price,
            order_type="00",  # 지정가
            side="BUY"
        )
        
        if buy_order and 'output' in buy_order:
            print(f"✅ 주문 접수 완료: {json.dumps(buy_order['output'], indent=2, ensure_ascii=False)}")
            
            # 주문 상세 정보가 있는 경우 출력
            if 'order_detail' in buy_order and buy_order['order_detail']:
                detail = buy_order['order_detail']
                print(f"\n📋 주문 상세:")
                print(f"   주문번호: {detail.get('odno')}")
                print(f"   종목: {detail.get('pdno')} ({detail.get('prdt_name')})")
                print(f"   주문수량: {int(detail.get('ord_qty', 0)):,}주")
                print(f"   주문가격: ${float(detail.get('ovrs_ord_unpr', 0)):,.2f}")
                print(f"   주문금액: ${float(detail.get('tot_ccld_amt', 0)):,.2f}")
                print(f"   체결수량: {int(detail.get('ccld_qty', 0)):,}주")
                print(f"   평균체결가: ${float(detail.get('avg_ccld_prc', 0)):,.2f}")
                print(f"   주문상태: {detail.get('ord_stln_nm')}")
        else:
            print("❌ 주문 실패")
            if buy_order:
                print(f"응답: {json.dumps(buy_order, ensure_ascii=False, indent=2)}")
        
        # 4. 시장가 매도 주문 (1주)
        print("\n💰 시장가 매도 주문 시도: AAPL 1주")
        sell_order = await kis.order_overseas_stock(
            symbol="AAPL",
            exchange="NAS",
            qty=1,
            price=0,  # 시장가 주문은 가격을 0으로 설정
            order_type="01",  # 시장가
            side="SELL"
        )
        
        if sell_order and 'output' in sell_order:
            print(f"✅ 주문 접수 완료: {json.dumps(sell_order['output'], indent=2, ensure_ascii=False)}")
        else:
            print("❌ 주문 실패")
            if sell_order:
                print(f"응답: {json.dumps(sell_order, ensure_ascii=False, indent=2)}")
    else:
        print("❌ 애플(AAPL) 주가 조회에 실패했습니다.")
        if aapl_info:
            print(f"응답: {json.dumps(aapl_info, ensure_ascii=False, indent=2)}")

async def main():
    # 토큰 발급 테스트
    await test_token()
    
    # 국내주식 현재가 조회 테스트
    await test_domestic_stock()
    
    # 해외주식 정보 조회 테스트
    # await test_overseas_stocks()
    
    # 해외주식 거래 테스트 (잔고 조회, 지정가/시장가 주문)
    await test_overseas_trading()

# 테스트 유틸리티 함수들
async def assert_response_success(response: Dict[str, Any], expected_keys: list = None):
    """응답이 성공했는지 검증하는 헬퍼 함수"""
    assert isinstance(response, dict), "응답은 딕셔너리여야 합니다."
    assert "rt_cd" in response, "응답에 rt_cd 키가 없습니다."
    assert response["rt_cd"] == "0", f"API 요청 실패: {response.get('msg1', '알 수 없는 오류')}"
    
    if expected_keys:
        for key in expected_keys:
            assert key in response, f"응답에 {key} 키가 없습니다."

# 비동기 테스트를 위한 픽스처
@pytest.fixture
async def kis_client():
    """KIS 클라이언트 인스턴스를 생성하는 픽스처"""
    client = KISClient()
    # 테스트 전에 토큰을 미리 가져옴
    await client.get_access_token()
    return client

# 모의 응답 데이터
MOCK_TOKEN_RESPONSE = {
    "access_token": "mock_access_token_12345",
    "token_type": "Bearer",
    "expires_in": 86400
}

MOCK_STOCK_QUOTE = {
    "rt_cd": "0",
    "output": {
        "stck_prpr": "75000",  # 현재가
        "prdy_vrss": "1500",   # 전일 대비
        "prdy_ctrt": "2.04",   # 등락률
        "acml_vol": "1234567", # 누적 거래량
        "acml_tr_pbmn": "9876543210"  # 누적 거래대금
    }
}

# 테스트 케이스
class TestKISClient:
    @pytest.mark.asyncio
    async def test_get_access_token_success(self, kis_client):
        """액세스 토큰을 성공적으로 가져오는지 테스트"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            # 모의 응답 설정
            mock_response = MagicMock()
            mock_response.status = 200
            mock_response.json.return_value = MOCK_TOKEN_RESPONSE
            mock_post.return_value.__aenter__.return_value = mock_response
            
            # 토큰 요청
            token = await kis_client.get_access_token(force_refresh=True)
            
            # 검증
            assert token == MOCK_TOKEN_RESPONSE["access_token"]
            assert kis_client.access_token == token
            assert kis_client.token_expires > datetime.now()
    
    @pytest.mark.asyncio
    async def test_get_korean_stock_quote(self, kis_client):
        """국내주식 현재가 조회 테스트"""
        with patch('aiohttp.ClientSession.get') as mock_get:
            # 모의 응답 설정
            mock_response = MagicMock()
            mock_response.status = 200
            mock_response.json.return_value = MOCK_STOCK_QUOTE
            mock_get.return_value.__aenter__.return_value = mock_response
            
            # 주식 조회 요청
            symbol = "005930"  # 삼성전자
            response = await kis_client.get_korean_stock_quote(symbol)
            
            # 검증
            await assert_response_success(response, ["output"])
            assert "stck_prpr" in response["output"]
    
    @pytest.mark.asyncio
    async def test_place_order(self, kis_client):
        """주문하기 테스트"""
        with patch('aiohttp.ClientSession.post') as mock_post:
            # 모의 응답 설정
            mock_response = MagicMock()
            mock_response.status = 200
            mock_response.json.return_value = {
                "rt_cd": "0",
                "output": {
                    "KRX_FWDG_ORD_ORGNO": "12345",
                    "ODNO": "0001234567",
                    "ORD_TMD": "153045"
                }
            }
            mock_post.return_value.__aenter__.return_value = mock_response
            
            # 주문 요청
            order_data = {
                "PDNO": "005930",
                "ORD_DVSN": "01",  # 01: 시장가
                "ORD_QTY": "10",
                "ORD_UNPR": "0",  # 시장가 주문 시 0
            }
            response = await kis_client.place_order(order_data, is_overseas=False)
            
            # 검증
            await assert_response_success(response, ["output"])
            assert "ODNO" in response["output"]  # 주문번호 확인

if __name__ == "__main__":
    # 환경 변수 체크
    required_vars = ["KIS_APP_KEY", "KIS_APP_SECRET"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ 다음 환경 변수가 설정되지 않았습니다: {', '.join(missing_vars)}")
        print("프로젝트 루트 디렉토리에 .env 파일을 생성하고 해당 변수들을 설정해주세요.")
        exit(1)
        
    # 테스트 실행
    asyncio.run(main())
