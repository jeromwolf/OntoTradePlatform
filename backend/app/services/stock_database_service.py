"""
주식 데이터베이스 관리 서비스
Supabase 테이블에서 주식 데이터 CRUD 작업
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from decimal import Decimal

from app.services.supabase_service import supabase_service
from app.services.stock_data_fetcher import stock_fetcher, MAJOR_STOCKS

logger = logging.getLogger(__name__)

class StockDatabaseService:
    """주식 데이터베이스 관리 클래스"""
    
    def __init__(self):
        self.supabase = supabase_service.supabase
    
    async def search_stocks(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """주식 검색 (한글/영어 모두 지원)"""
        try:
            # 검색어 정리
            clean_query = query.strip()
            if not clean_query:
                return []
            
            # 여러 검색 방법을 조합하여 최적의 결과 제공
            search_query = f"""
            SELECT DISTINCT
                symbol,
                name,
                name_kr,
                market,
                price,
                change_amount,
                change_percent,
                volume,
                market_cap,
                currency,
                sector,
                industry,
                last_updated
            FROM stocks 
            WHERE is_active = true
            AND (
                -- 심볼 정확히 매치 (최우선)
                UPPER(symbol) = UPPER(%s)
                OR 
                -- 심볼 시작 매치
                UPPER(symbol) LIKE UPPER(%s)
                OR
                -- 영어 이름 검색 (대소문자 무시)
                LOWER(name) LIKE LOWER(%s)
                OR
                -- 한글 이름 검색 (대소문자 무시)
                LOWER(name_kr) LIKE LOWER(%s)
                OR
                -- Full text search (backup)
                to_tsvector('simple', COALESCE(name, '')) @@ plainto_tsquery('simple', %s)
                OR
                to_tsvector('simple', COALESCE(name_kr, '')) @@ plainto_tsquery('simple', %s)
            )
            ORDER BY 
                -- 정확한 심볼 매치 우선
                CASE WHEN UPPER(symbol) = UPPER(%s) THEN 1 ELSE 2 END,
                -- 심볼 시작 매치 우선  
                CASE WHEN UPPER(symbol) LIKE UPPER(%s) THEN 1 ELSE 2 END,
                -- 이름 시작 매치 우선
                CASE WHEN LOWER(name) LIKE LOWER(%s) OR LOWER(name_kr) LIKE LOWER(%s) THEN 1 ELSE 2 END,
                symbol
            LIMIT %s;
            """
            
            # 검색 파라미터 준비
            like_pattern = f"{clean_query}%"
            contains_pattern = f"%{clean_query}%"
            
            params = [
                clean_query,           # 정확한 심볼 매치
                like_pattern,          # 심볼 시작 매치  
                contains_pattern,      # 영어 이름 포함 검색
                contains_pattern,      # 한글 이름 포함 검색
                clean_query,           # Full text search - name
                clean_query,           # Full text search - name_kr
                clean_query,           # ORDER BY - 정확한 심볼 매치
                like_pattern,          # ORDER BY - 심볼 시작 매치
                like_pattern,          # ORDER BY - 이름 시작 매치 (영어)
                like_pattern,          # ORDER BY - 이름 시작 매치 (한글)
                limit
            ]
            
            # 쿼리 실행
            response = self.supabase.rpc('execute_query', {
                'query': search_query,
                'params': params
            }).execute()
            
            if response.data:
                logger.info(f"Found {len(response.data)} stocks for query: {query}")
                return response.data
            else:
                logger.warning(f"No stocks found for query: {query}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching stocks: {str(e)}")
            return []
    
    async def _fallback_search(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """폴백 검색 (클라이언트 사이드)"""
        try:
            response = self.supabase.table('stocks')\
                .select('symbol, name, name_kr, price, change_percent, volume, market')\
                .eq('is_active', True)\
                .execute()
            
            if not response.data:
                return []
            
            # 클라이언트에서 필터링
            query_lower = query.lower()
            filtered = []
            
            for stock in response.data:
                if (query_lower in (stock.get('symbol', '') or '').lower() or
                    query_lower in (stock.get('name', '') or '').lower() or
                    query_lower in (stock.get('name_kr', '') or '').lower()):
                    filtered.append(stock)
            
            # 정렬 및 제한
            filtered.sort(key=lambda x: (
                0 if x.get('symbol', '').upper() == query.upper() else
                1 if x.get('symbol', '').upper().startswith(query.upper()) else
                2 if (x.get('name', '') or '').lower().startswith(query_lower) else
                3 if (x.get('name_kr', '') or '').lower().startswith(query_lower) else 4
            ))
            
            return filtered[:limit]
            
        except Exception as e:
            logger.error(f"Fallback search error: {str(e)}")
            return []
    
    async def get_stock_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        """심볼로 주식 데이터 조회"""
        try:
            response = self.supabase.table('stocks')\
                .select('*')\
                .eq('symbol', symbol.upper())\
                .eq('is_active', True)\
                .single()\
                .execute()
            
            return response.data if response.data else None
            
        except Exception as e:
            logger.error(f"Error fetching stock {symbol}: {str(e)}")
            return None
    
    async def upsert_stock(self, stock_data: Dict[str, Any]) -> bool:
        """주식 데이터 추가/업데이트"""
        try:
            # 데이터 정규화
            normalized_data = {
                'symbol': stock_data['symbol'].upper(),
                'name': stock_data['name'],
                'name_kr': stock_data.get('name_kr'),
                'market': stock_data.get('market', 'NASDAQ'),
                'price': float(stock_data['price']),
                'open_price': stock_data.get('open_price'),
                'high_price': stock_data.get('high_price'),
                'low_price': stock_data.get('low_price'),
                'previous_close': stock_data.get('previous_close'),
                'change_amount': stock_data.get('change_amount'),
                'change_percent': stock_data.get('change_percent'),
                'volume': stock_data.get('volume'),
                'market_cap': stock_data.get('market_cap'),
                'currency': stock_data.get('currency', 'USD'),
                'sector': stock_data.get('sector'),
                'industry': stock_data.get('industry'),
                'description': stock_data.get('description'),
                'is_active': True,
                'last_updated': datetime.utcnow().isoformat()
            }
            
            # 빈 값 제거
            normalized_data = {k: v for k, v in normalized_data.items() if v is not None}
            
            response = self.supabase.table('stocks').upsert(normalized_data).execute()
            
            return response.data is not None
            
        except Exception as e:
            logger.error(f"Error upserting stock data: {str(e)}")
            return False
    
    async def bulk_upsert_stocks(self, stocks_data: List[Dict[str, Any]]) -> int:
        """여러 주식 데이터 일괄 업데이트"""
        success_count = 0
        
        for stock_data in stocks_data:
            if await self.upsert_stock(stock_data):
                success_count += 1
        
        logger.info(f"Successfully updated {success_count}/{len(stocks_data)} stocks")
        return success_count
    
    async def sync_from_external_api(self, symbols: List[str] = None) -> Dict[str, Any]:
        """외부 API에서 데이터를 가져와서 데이터베이스 동기화"""
        try:
            if symbols is None:
                symbols = list(MAJOR_STOCKS.keys())
            
            logger.info(f"Syncing {len(symbols)} stocks from external APIs")
            
            # 외부 API에서 데이터 가져오기
            external_data = await stock_fetcher.fetch_multiple_stocks(symbols)
            
            # 한글명 추가
            for symbol, data in external_data.items():
                if symbol in MAJOR_STOCKS:
                    # 한글명 추출 (괄호 안의 내용)
                    full_name = MAJOR_STOCKS[symbol]
                    if '(' in full_name and ')' in full_name:
                        kr_name = full_name.split('(')[1].split(')')[0]
                        data['name_kr'] = kr_name
                        data['name'] = full_name
                    else:
                        data['name'] = full_name
            
            # 데이터베이스에 저장
            stocks_list = list(external_data.values())
            updated_count = await self.bulk_upsert_stocks(stocks_list)
            
            return {
                'total_requested': len(symbols),
                'fetched_from_api': len(external_data),
                'updated_in_db': updated_count,
                'failed_symbols': [s for s in symbols if s not in external_data],
                'updated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error syncing stock data: {str(e)}")
            return {
                'error': str(e),
                'total_requested': len(symbols) if symbols else 0,
                'updated_in_db': 0
            }
    
    async def get_all_active_stocks(self) -> List[Dict[str, Any]]:
        """모든 활성 주식 목록 조회"""
        try:
            response = self.supabase.table('stocks')\
                .select('symbol, name, name_kr, price, change_percent, volume, market')\
                .eq('is_active', True)\
                .order('symbol')\
                .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error fetching all stocks: {str(e)}")
            return []
    
    async def initialize_sample_data(self) -> bool:
        """샘플 주식 데이터 초기화"""
        try:
            sample_data = []
            
            for symbol, name in MAJOR_STOCKS.items():
                # 한글명 추출
                kr_name = None
                if '(' in name and ')' in name:
                    kr_name = name.split('(')[1].split(')')[0]
                
                sample_data.append({
                    'symbol': symbol,
                    'name': name,
                    'name_kr': kr_name,
                    'market': 'NASDAQ',
                    'price': 100.0,  # 임시 가격
                    'currency': 'USD',
                    'is_active': True
                })
            
            updated_count = await self.bulk_upsert_stocks(sample_data)
            logger.info(f"Initialized {updated_count} sample stocks")
            
            return updated_count > 0
            
        except Exception as e:
            logger.error(f"Error initializing sample data: {str(e)}")
            return False

# 글로벌 인스턴스
stock_db_service = StockDatabaseService()
