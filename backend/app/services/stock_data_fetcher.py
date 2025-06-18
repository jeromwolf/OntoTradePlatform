"""
실제 주식 데이터 API 연동 서비스
Alpha Vantage, Twelve Data, Yahoo Finance 등에서 실시간 데이터 수집
"""

import asyncio
import aiohttp
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import os
from decimal import Decimal

logger = logging.getLogger(__name__)

class StockDataFetcher:
    """실제 주식 데이터를 외부 API에서 가져오는 클래스"""
    
    def __init__(self):
        # API 키들 (환경변수에서 가져오기)
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.twelve_data_key = os.getenv('TWELVE_DATA_API_KEY')
        self.fmp_key = os.getenv('FMP_API_KEY')  # Financial Modeling Prep
        
        # 무료 API 제한
        self.request_delay = 1.0  # 초 단위
        
    async def fetch_stock_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """단일 주식의 실시간 데이터 가져오기"""
        try:
            # 여러 API를 시도해서 데이터 가져오기
            providers = [
                self._fetch_from_alpha_vantage,
                self._fetch_from_twelve_data,
                self._fetch_from_fmp,
                self._fetch_from_yahoo_finance  # 무료 백업
            ]
            
            for provider in providers:
                try:
                    data = await provider(symbol)
                    if data:
                        logger.info(f"Successfully fetched {symbol} from {provider.__name__}")
                        return data
                except Exception as e:
                    logger.warning(f"Failed to fetch {symbol} from {provider.__name__}: {str(e)}")
                    continue
                    
            logger.error(f"All providers failed for symbol: {symbol}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            return None
    
    async def _fetch_from_alpha_vantage(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Alpha Vantage API에서 데이터 가져오기"""
        if not self.alpha_vantage_key:
            return None
            
        url = f"https://www.alphavantage.co/query"
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': self.alpha_vantage_key
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_alpha_vantage_data(data, symbol)
        return None
    
    async def _fetch_from_twelve_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Twelve Data API에서 데이터 가져오기"""
        if not self.twelve_data_key:
            return None
            
        url = f"https://api.twelvedata.com/quote"
        params = {
            'symbol': symbol,
            'apikey': self.twelve_data_key
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_twelve_data(data, symbol)
        return None
    
    async def _fetch_from_fmp(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Financial Modeling Prep API에서 데이터 가져오기"""
        if not self.fmp_key:
            return None
            
        url = f"https://financialmodelingprep.com/api/v3/quote/{symbol}"
        params = {'apikey': self.fmp_key}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        return self._parse_fmp_data(data[0], symbol)
        return None
    
    async def _fetch_from_yahoo_finance(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Yahoo Finance API에서 데이터 가져오기 (무료 백업)"""
        try:
            import yfinance as yf
            
            # yfinance 패키지를 사용한 데이터 가져오기
            ticker = yf.Ticker(symbol)
            info = ticker.info
            history = ticker.history(period="1d")
            
            if not history.empty:
                latest = history.iloc[-1]
                return {
                    'symbol': symbol,
                    'name': info.get('longName', f'{symbol} Corp'),
                    'price': float(latest['Close']),
                    'open_price': float(latest['Open']),
                    'high_price': float(latest['High']),
                    'low_price': float(latest['Low']),
                    'previous_close': float(info.get('previousClose', latest['Close'])),
                    'volume': int(latest['Volume']),
                    'market_cap': info.get('marketCap'),
                    'sector': info.get('sector'),
                    'industry': info.get('industry'),
                    'description': info.get('longBusinessSummary', ''),
                    'currency': info.get('currency', 'USD'),
                    'source': 'Yahoo Finance'
                }
        except ImportError:
            logger.warning("yfinance package not installed")
        except Exception as e:
            logger.error(f"Yahoo Finance fetch error: {str(e)}")
        
        return None
    
    def _parse_alpha_vantage_data(self, data: Dict, symbol: str) -> Optional[Dict[str, Any]]:
        """Alpha Vantage 응답 파싱"""
        try:
            quote = data.get('Global Quote', {})
            if not quote:
                return None
                
            return {
                'symbol': symbol,
                'name': f'{symbol} Corp',  # Alpha Vantage는 회사명 제공 안함
                'price': float(quote.get('05. price', 0)),
                'open_price': float(quote.get('02. open', 0)),
                'high_price': float(quote.get('03. high', 0)),
                'low_price': float(quote.get('04. low', 0)),
                'previous_close': float(quote.get('08. previous close', 0)),
                'change_amount': float(quote.get('09. change', 0)),
                'change_percent': float(quote.get('10. change percent', '0%').replace('%', '')),
                'volume': int(quote.get('06. volume', 0)),
                'source': 'Alpha Vantage'
            }
        except Exception as e:
            logger.error(f"Error parsing Alpha Vantage data: {str(e)}")
            return None
    
    def _parse_twelve_data(self, data: Dict, symbol: str) -> Optional[Dict[str, Any]]:
        """Twelve Data 응답 파싱"""
        try:
            if data.get('status') == 'error':
                return None
                
            return {
                'symbol': symbol,
                'name': data.get('name', f'{symbol} Corp'),
                'price': float(data.get('close', 0)),
                'open_price': float(data.get('open', 0)),
                'high_price': float(data.get('high', 0)),
                'low_price': float(data.get('low', 0)),
                'previous_close': float(data.get('previous_close', 0)),
                'change_amount': float(data.get('change', 0)),
                'change_percent': float(data.get('percent_change', 0)),
                'volume': int(data.get('volume', 0)),
                'source': 'Twelve Data'
            }
        except Exception as e:
            logger.error(f"Error parsing Twelve Data: {str(e)}")
            return None
    
    def _parse_fmp_data(self, data: Dict, symbol: str) -> Optional[Dict[str, Any]]:
        """Financial Modeling Prep 응답 파싱"""
        try:
            return {
                'symbol': symbol,
                'name': data.get('name', f'{symbol} Corp'),
                'price': float(data.get('price', 0)),
                'open_price': float(data.get('open', 0)),
                'high_price': float(data.get('dayHigh', 0)),
                'low_price': float(data.get('dayLow', 0)),
                'previous_close': float(data.get('previousClose', 0)),
                'change_amount': float(data.get('change', 0)),
                'change_percent': float(data.get('changesPercentage', 0)),
                'volume': int(data.get('volume', 0)),
                'market_cap': data.get('marketCap'),
                'source': 'FMP'
            }
        except Exception as e:
            logger.error(f"Error parsing FMP data: {str(e)}")
            return None
    
    async def fetch_multiple_stocks(self, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """여러 주식 데이터를 동시에 가져오기"""
        tasks = []
        for symbol in symbols:
            task = asyncio.create_task(self.fetch_stock_data(symbol))
            tasks.append((symbol, task))
            # API 제한 방지를 위한 지연
            await asyncio.sleep(self.request_delay)
        
        results = {}
        for symbol, task in tasks:
            try:
                data = await task
                if data:
                    results[symbol] = data
            except Exception as e:
                logger.error(f"Error fetching {symbol}: {str(e)}")
        
        return results

# 글로벌 인스턴스
stock_fetcher = StockDataFetcher()

# 주요 주식 목록 (한글명 포함)
MAJOR_STOCKS = {
    'AAPL': 'Apple Inc. (애플)',
    'GOOGL': 'Alphabet Inc. (구글)',
    'MSFT': 'Microsoft Corp. (마이크로소프트)',
    'TSLA': 'Tesla Inc. (테슬라)',
    'AMZN': 'Amazon.com Inc. (아마존)',
    'NVDA': 'NVIDIA Corp. (엔비디아)',
    'META': 'Meta Platforms Inc. (메타)',
    'NFLX': 'Netflix Inc. (넷플릭스)',
    'AMD': 'Advanced Micro Devices (AMD)',
    'CRM': 'Salesforce Inc. (세일즈포스)',
    'ADBE': 'Adobe Inc. (어도비)',
    'PYPL': 'PayPal Holdings (페이팔)',
    'INTC': 'Intel Corp. (인텔)',
    'BABA': 'Alibaba Group (알리바바)',
    'UBER': 'Uber Technologies (우버)'
}
