"""
Supabase 데이터베이스 서비스
시뮬레이션 및 관심종목 데이터 관리
"""

from typing import Dict, List, Optional, Any
from decimal import Decimal
from datetime import datetime
import asyncio
import logging

from app.core.supabase import get_supabase_client
from app.core.logging_system import log_info, log_error

class SupabaseService:
    """Supabase 데이터베이스 연동 서비스"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    # ===========================================
    # 시뮬레이션 세션 관리
    # ===========================================
    
    async def get_simulation_session(self, user_id: str) -> Optional[Dict]:
        """사용자 시뮬레이션 세션 조회"""
        try:
            result = self.supabase.table("simulation_sessions").select("*").eq("user_id", user_id).execute()
            
            if result.data:
                session = result.data[0]
                # Decimal을 float로 변환
                session["cash"] = float(session["cash"])
                session["total_value"] = float(session["total_value"])
                session["total_pnl"] = float(session["total_pnl"] or 0)
                session["total_pnl_percent"] = float(session["total_pnl_percent"] or 0)
                return session
            return None
            
        except Exception as e:
            log_error(f"시뮬레이션 세션 조회 실패: {e}")
            return None
    
    async def create_simulation_session(self, user_id: str, cash: float = 100000000) -> Dict:
        """새 시뮬레이션 세션 생성"""
        try:
            session_data = {
                "user_id": user_id,
                "cash": cash,
                "total_value": cash,
                "total_pnl": 0,
                "total_pnl_percent": 0
            }
            
            result = self.supabase.table("simulation_sessions").insert(session_data).execute()
            
            if result.data:
                session = result.data[0]
                session["cash"] = float(session["cash"])
                session["total_value"] = float(session["total_value"])
                session["total_pnl"] = float(session["total_pnl"])
                session["total_pnl_percent"] = float(session["total_pnl_percent"])
                log_info(f"새 시뮬레이션 세션 생성: {user_id}")
                return session
            
            raise Exception("세션 생성 실패")
            
        except Exception as e:
            log_error(f"시뮬레이션 세션 생성 실패: {e}")
            raise
    
    async def update_simulation_session(
        self, 
        user_id: str, 
        cash: float = None,
        total_value: float = None,
        total_pnl: float = None,
        total_pnl_percent: float = None
    ) -> Dict:
        """시뮬레이션 세션 업데이트"""
        try:
            update_data = {}
            if cash is not None:
                update_data["cash"] = cash
            if total_value is not None:
                update_data["total_value"] = total_value
            if total_pnl is not None:
                update_data["total_pnl"] = total_pnl
            if total_pnl_percent is not None:
                update_data["total_pnl_percent"] = total_pnl_percent
            
            result = await self.supabase.table("simulation_sessions").update(update_data).eq("user_id", user_id).execute()
            
            if not result.data:
                raise Exception("시뮬레이션 세션 업데이트에 실패했습니다.")
            
            return result.data[0]
        except Exception as e:
            logging.error(f"시뮬레이션 세션 업데이트 중 오류: {str(e)}")
            raise
    
    async def update_simulation_session_old(self, user_id: str, **kwargs) -> bool:
        """시뮬레이션 세션 업데이트"""
        try:
            result = self.supabase.table("simulation_sessions").update(kwargs).eq("user_id", user_id).execute()
            return len(result.data) > 0
            
        except Exception as e:
            log_error(f"시뮬레이션 세션 업데이트 실패: {e}")
            return False
    
    # ===========================================
    # 시뮬레이션 보유종목 관리
    # ===========================================
    
    async def get_simulation_holdings(self, user_id: str) -> List[Dict]:
        """사용자 보유종목 조회"""
        try:
            result = self.supabase.table("simulation_holdings").select("*").eq("user_id", user_id).execute()
            
            holdings = []
            for holding in result.data:
                holding["avg_price"] = float(holding["avg_price"])
                holdings.append(holding)
            
            return holdings
            
        except Exception as e:
            log_error(f"보유종목 조회 실패: {e}")
            return []
    
    async def upsert_holding(self, user_id: str, symbol: str, quantity: int, avg_price: float) -> Dict:
        """보유종목 추가/업데이트"""
        try:
            if quantity == 0:
                # 수량이 0이면 삭제
                result = await self.supabase.table("simulation_holdings").delete().match({
                    "user_id": user_id,
                    "symbol": symbol
                }).execute()
            else:
                # 추가/업데이트
                data = {
                    "user_id": user_id,
                    "symbol": symbol,
                    "quantity": quantity,
                    "avg_price": avg_price
                }
                
                result = await self.supabase.table("simulation_holdings").upsert(data).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            logging.error(f"보유종목 업데이트 중 오류: {str(e)}")
            raise
    
    async def upsert_holding_old(self, user_id: str, symbol: str, quantity: int, avg_price: float) -> bool:
        """보유종목 추가/업데이트"""
        try:
            if quantity == 0:
                # 수량이 0이면 삭제
                result = self.supabase.table("simulation_holdings").delete().eq("user_id", user_id).eq("symbol", symbol).execute()
            else:
                holding_data = {
                    "user_id": user_id,
                    "symbol": symbol,
                    "quantity": quantity,
                    "avg_price": avg_price
                }
                
                result = self.supabase.table("simulation_holdings").upsert(holding_data).execute()
            
            return len(result.data) >= 0  # upsert/delete 성공 시 빈 배열도 OK
            
        except Exception as e:
            log_error(f"보유종목 업데이트 실패: {e}")
            return False
    
    # ===========================================
    # 시뮬레이션 거래내역 관리
    # ===========================================
    
    async def add_transaction(self, user_id: str, symbol: str, type: str, quantity: int, price: float) -> bool:
        """거래내역 추가"""
        try:
            transaction_data = {
                "user_id": user_id,
                "symbol": symbol,
                "type": type,
                "quantity": quantity,
                "price": price,
                "total_amount": quantity * price
            }
            
            result = self.supabase.table("simulation_transactions").insert(transaction_data).execute()
            return len(result.data) > 0
            
        except Exception as e:
            log_error(f"거래내역 추가 실패: {e}")
            return False
    
    async def get_transactions(self, user_id: str, limit: int = 50) -> List[Dict]:
        """거래내역 조회"""
        try:
            result = (self.supabase.table("simulation_transactions")
                     .select("*")
                     .eq("user_id", user_id)
                     .order("created_at", desc=True)
                     .limit(limit)
                     .execute())
            
            transactions = []
            for txn in result.data:
                txn["price"] = float(txn["price"])
                txn["total_amount"] = float(txn["total_amount"])
                transactions.append(txn)
            
            return transactions
            
        except Exception as e:
            log_error(f"거래내역 조회 실패: {e}")
            return []
    
    # ===========================================
    # 시뮬레이션 리더보드 관리
    # ===========================================
    
    async def get_simulation_leaderboard(self, limit: int = 20) -> List[Dict]:
        """시뮬레이션 리더보드 조회"""
        try:
            result = self.supabase.table("simulation_sessions").select("*").order("total_pnl_percent", desc=True).limit(limit).execute()
            
            leaderboard = []
            for idx, session in enumerate(result.data):
                leaderboard.append({
                    "rank": idx + 1,
                    "user_id": session["user_id"],
                    "total_value": session["total_value"],
                    "total_pnl": session["total_pnl"],
                    "total_pnl_percent": session["total_pnl_percent"],
                    "cash": session["cash"],
                    "created_at": session["created_at"],
                    "updated_at": session["updated_at"]
                })
            
            return leaderboard
        except Exception as e:
            logging.error(f"리더보드 조회 중 오류: {str(e)}")
            raise
    
    # ===========================================
    # 관심종목 관리
    # ===========================================
    
    async def get_watchlist(self, user_id: str) -> List[Dict]:
        """사용자 관심종목 목록 조회"""
        try:
            result = (self.supabase.table("user_watchlists")
                     .select("*")
                     .eq("user_id", user_id)
                     .order("created_at", desc=True)
                     .execute())
            
            return result.data or []
            
        except Exception as e:
            log_error(f"관심종목 조회 실패: {e}")
            return []
    
    async def add_to_watchlist(self, user_id: str, symbol: str, name: str, **kwargs) -> bool:
        """관심종목 추가"""
        try:
            watchlist_data = {
                "user_id": user_id,
                "symbol": symbol,
                "name": name,
                **kwargs  # market, type, region, currency, memo
            }
            
            result = self.supabase.table("user_watchlists").insert(watchlist_data).execute()
            return len(result.data) > 0
            
        except Exception as e:
            log_error(f"관심종목 추가 실패: {e}")
            return False
    
    async def remove_from_watchlist(self, user_id: str, symbol: str) -> bool:
        """관심종목 제거"""
        try:
            result = (self.supabase.table("user_watchlists")
                     .delete()
                     .eq("user_id", user_id)
                     .eq("symbol", symbol)
                     .execute())
            
            return len(result.data) >= 0
            
        except Exception as e:
            log_error(f"관심종목 제거 실패: {e}")
            return False
    
    async def is_in_watchlist(self, user_id: str, symbol: str) -> bool:
        """관심종목 포함 여부 확인"""
        try:
            result = (self.supabase.table("user_watchlists")
                     .select("symbol")
                     .eq("user_id", user_id)
                     .eq("symbol", symbol)
                     .execute())
            
            return len(result.data) > 0
            
        except Exception as e:
            log_error(f"관심종목 확인 실패: {e}")
            return False

# 싱글톤 인스턴스
supabase_service = SupabaseService()
