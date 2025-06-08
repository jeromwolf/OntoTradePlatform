"""
종목 검색 서비스
Alpha Vantage와 Yahoo Finance를 활용한 통합 종목 검색
"""

import asyncio
import logging
from typing import List, Dict, Optional, Union
import aiohttp
# import yfinance as yf  # 임시로 주석처리
from datetime import datetime
import os
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class StockSearchResult:
    """종목 검색 결과"""
    symbol: str
    name: str
    market: str  # "NYSE", "NASDAQ", "KOSPI", "KOSDAQ" 등
    type: str    # "Stock", "ETF", "Index" 등
    region: str  # "US", "KR" 등
    currency: str = "USD"

class StockSearchService:
    """통합 종목 검색 서비스"""
    
    def __init__(self):
        self.alpha_vantage_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_stocks(
        self, 
        query: str, 
        market: str = "all", 
        limit: int = 50
    ) -> List[StockSearchResult]:
        """
        통합 종목 검색
        
        Args:
            query: 검색어 (종목명 또는 심볼)
            market: "all", "us", "kr"
            limit: 결과 개수 제한
            
        Returns:
            검색 결과 리스트
        """
        try:
            results = []
            
            # Alpha Vantage 검색 (주로 미국 주식)
            if market in ["all", "us"]:
                alpha_results = await self._search_alpha_vantage(query)
                results.extend(alpha_results)
            
            # Yahoo Finance 검색 (글로벌)
            yahoo_results = await self._search_yahoo_finance(query, market)
            results.extend(yahoo_results)
            
            # 중복 제거 (심볼 기준)
            unique_results = self._deduplicate_results(results)
            
            # 정렬 (정확도 순)
            sorted_results = self._sort_by_relevance(unique_results, query)
            
            return sorted_results[:limit]
            
        except Exception as e:
            logger.error(f"종목 검색 중 오류: {e}")
            return []
    
    async def _search_alpha_vantage(self, query: str) -> List[StockSearchResult]:
        """Alpha Vantage Symbol Search API"""
        if not self.alpha_vantage_key:
            logger.warning("Alpha Vantage API 키가 설정되지 않음")
            return []
            
        try:
            url = "https://www.alphavantage.co/query"
            params = {
                "function": "SYMBOL_SEARCH",
                "keywords": query,
                "apikey": self.alpha_vantage_key
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return []
                    
                data = await response.json()
                
                if "bestMatches" not in data:
                    return []
                
                results = []
                for match in data["bestMatches"]:
                    result = StockSearchResult(
                        symbol=match.get("1. symbol", ""),
                        name=match.get("2. name", ""),
                        market=self._parse_market_from_alpha(match.get("4. region", "")),
                        type=match.get("3. type", "Stock"),
                        region=match.get("4. region", "US"),
                        currency=match.get("8. currency", "USD")
                    )
                    results.append(result)
                
                return results
                
        except Exception as e:
            logger.error(f"Alpha Vantage 검색 오류: {e}")
            return []
    
    async def _search_yahoo_finance(self, query: str, market: str = "all") -> List[StockSearchResult]:
        """Yahoo Finance 검색 (비동기 래퍼)"""
        try:
            # yfinance는 동기 함수이므로 ThreadPoolExecutor 사용
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None, 
                self._yahoo_search_sync, 
                query, 
                market
            )
            return results
        except Exception as e:
            logger.error(f"Yahoo Finance 검색 오류: {e}")
            return []
    
    def _yahoo_search_sync(self, query: str, market: str) -> List[StockSearchResult]:
        """Yahoo Finance 동기 검색 - 임시로 비활성화"""
        # 임시로 yfinance 오류 해결을 위해 빈 리스트 반환
        return []
        
        # results = []
        # 
        # try:
        #     # 일반적인 심볼 패턴들 생성
        #     symbols_to_try = self._generate_symbol_patterns(query, market)
        #     
        #     for symbol in symbols_to_try:
        #         try:
        #             ticker = yf.Ticker(symbol)
        #             info = ticker.info
        #             
        #             if info and "symbol" in info and "longName" in info:
        #                 result = StockSearchResult(
        #                     symbol=info["symbol"],
        #                     name=info["longName"],
        #                     market=info.get("exchange", market).upper(),
        #                     type="Stock",
        #                     region=market.upper(),
        #                     currency=info.get("currency", "USD")
        #                 )
        #                 results.append(result)
        #                 
        #                 # 너무 많은 API 호출 방지
        #                 if len(results) >= 10:
        #                     break
        #                     
        #         except Exception:
        #             continue
        #             
        # except Exception as e:
        #     logger.error(f"Yahoo Finance 동기 검색 오류: {e}")
        #     
        # return results
    
    def _generate_symbol_patterns(self, query: str, market: str) -> List[str]:
        """검색어로부터 가능한 심볼 패턴 생성"""
        patterns = []
        
        # 원본 검색어
        patterns.append(query.upper())
        
        if market in ["all", "us"]:
            # 미국 주식 패턴들
            patterns.extend([
                query.upper(),
                f"{query.upper()}.US"
            ])
        
        if market in ["all", "kr"]:
            # 한국 주식 패턴들
            patterns.extend([
                f"{query}.KS",    # KOSPI
                f"{query}.KQ",    # KOSDAQ
                f"{query:0>6}.KS" if query.isdigit() else f"{query}.KS",
                f"{query:0>6}.KQ" if query.isdigit() else f"{query}.KQ"
            ])
        
        return list(set(patterns))  # 중복 제거
    
    def _parse_market_from_alpha(self, region: str) -> str:
        """Alpha Vantage 지역 정보에서 거래소 파싱"""
        region_upper = region.upper()
        if "UNITED STATES" in region_upper:
            return "NYSE/NASDAQ"
        elif "KOREA" in region_upper:
            return "KRX"
        else:
            return region
    
    def _determine_security_type(self, info: Dict) -> str:
        """Yahoo Finance 정보에서 증권 유형 결정"""
        quote_type = info.get("quoteType", "").upper()
        
        if quote_type == "ETF":
            return "ETF"
        elif quote_type == "MUTUALFUND":
            return "Fund"
        elif quote_type == "INDEX":
            return "Index"
        else:
            return "Stock"
    
    def _determine_region(self, info: Dict) -> str:
        """Yahoo Finance 정보에서 지역 결정"""
        country = info.get("country", "")
        exchange = info.get("exchange", "")
        
        if country == "South Korea" or exchange in ["KRX", "KSE", "KOE"]:
            return "KR"
        elif country == "United States" or exchange in ["NYSE", "NASDAQ", "NYQ", "NMS"]:
            return "US"
        else:
            return "Global"
    
    def _deduplicate_results(self, results: List[StockSearchResult]) -> List[StockSearchResult]:
        """심볼 기준으로 중복 제거"""
        seen_symbols = set()
        unique_results = []
        
        for result in results:
            symbol_key = result.symbol.upper()
            if symbol_key not in seen_symbols:
                seen_symbols.add(symbol_key)
                unique_results.append(result)
        
        return unique_results
    
    def _sort_by_relevance(self, results: List[StockSearchResult], query: str) -> List[StockSearchResult]:
        """검색어와의 관련성으로 정렬"""
        query_upper = query.upper()
        
        def relevance_score(result: StockSearchResult) -> int:
            score = 0
            
            # 심볼 완전 일치
            if result.symbol.upper() == query_upper:
                score += 100
            
            # 심볼 시작 일치  
            elif result.symbol.upper().startswith(query_upper):
                score += 50
            
            # 이름 포함
            if query_upper in result.name.upper():
                score += 30
            
            # 이름 시작 일치
            if result.name.upper().startswith(query_upper):
                score += 20
            
            return score
        
        return sorted(results, key=relevance_score, reverse=True)

# 전역 인스턴스
stock_search_service = StockSearchService()
