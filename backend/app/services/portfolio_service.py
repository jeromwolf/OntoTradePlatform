"""
포트폴리오 관리 서비스
OntoTradePlatform - Task 5.1
"""

import json
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

from supabase import Client
from app.core.supabase import get_supabase_client
from app.core.logging_system import log_api_call, log_info, log_error

from app.models.portfolio import (
    Portfolio, PortfolioCreate, PortfolioUpdate,
    Holding, HoldingCreate, HoldingUpdate,
    Transaction, TransactionCreate,
    Performance, PerformanceCreate,
    Settings, SettingsCreate, SettingsUpdate,
    PortfolioSummary, PortfolioDetail, PortfolioStats,
    RiskLevel, TransactionType, RebalancingFrequency
)


class PortfolioService:
    """포트폴리오 관리 서비스"""

    def __init__(self):
        self.supabase: Client = get_supabase_client()

    async def create_portfolio(
        self, user_id: UUID, portfolio_data: PortfolioCreate
    ) -> Portfolio:
        """새 포트폴리오 생성"""
        try:
            log_info(f"새 포트폴리오 생성 시작: {portfolio_data.name}", category="portfolio")
            
            # 포트폴리오 생성
            portfolio_dict = {
                "id": str(uuid4()),
                "user_id": str(user_id),
                "name": portfolio_data.name,
                "description": portfolio_data.description,
                "initial_balance": float(portfolio_data.initial_balance),
                "current_balance": float(portfolio_data.initial_balance),
                "total_value": float(portfolio_data.initial_balance),
                "risk_level": portfolio_data.risk_level.value,
                "investment_goal": portfolio_data.investment_goal,
                "target_return": float(portfolio_data.target_return) if portfolio_data.target_return else None,
                "is_active": True,
                "metadata": {},
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }

            result = self.supabase.table("portfolios").insert(portfolio_dict).execute()
            
            if not result.data:
                raise Exception("포트폴리오 생성 실패")

            portfolio_data_result = result.data[0]
            
            # 기본 설정 생성
            await self._create_default_settings(UUID(portfolio_data_result["id"]))
            
            log_info(f"포트폴리오 생성 완료: {portfolio_data_result['name']}", category="portfolio")
            
            return Portfolio(**portfolio_data_result)

        except Exception as e:
            log_error(f"포트폴리오 생성 실패: {str(e)}", category="portfolio")
            raise

    async def get_portfolios(self, user_id: UUID) -> List[Portfolio]:
        """사용자 포트폴리오 목록 조회"""
        try:
            result = self.supabase.table("portfolios").select("*").eq(
                "user_id", str(user_id)
            ).eq("is_active", True).order("created_at", desc=True).execute()

            portfolios = [Portfolio(**portfolio) for portfolio in result.data]
            
            log_info(f"포트폴리오 목록 조회 완료: {len(portfolios)}개", category="portfolio")
            
            return portfolios

        except Exception as e:
            log_error(f"포트폴리오 목록 조회 실패: {str(e)}", category="portfolio")
            raise

    async def get_portfolio_detail(
        self, portfolio_id: UUID, user_id: UUID
    ) -> Optional[PortfolioDetail]:
        """포트폴리오 상세 정보 조회"""
        try:
            # 포트폴리오 기본 정보
            portfolio_result = self.supabase.table("portfolios").select("*").eq(
                "id", str(portfolio_id)
            ).eq("user_id", str(user_id)).single().execute()

            if not portfolio_result.data:
                return None

            portfolio = Portfolio(**portfolio_result.data)

            # 보유 종목 조회
            holdings_result = self.supabase.table("portfolio_holdings").select("*").eq(
                "portfolio_id", str(portfolio_id)
            ).execute()
            
            holdings = [Holding(**holding) for holding in holdings_result.data]

            # 최근 거래 내역 조회 (최근 10건)
            transactions_result = self.supabase.table("portfolio_transactions").select("*").eq(
                "portfolio_id", str(portfolio_id)
            ).order("executed_at", desc=True).limit(10).execute()
            
            transactions = [Transaction(**tx) for tx in transactions_result.data]

            # 설정 조회
            settings_result = self.supabase.table("portfolio_settings").select("*").eq(
                "portfolio_id", str(portfolio_id)
            ).single().execute()
            
            settings = Settings(**settings_result.data) if settings_result.data else None

            # 성과 요약 계산
            performance_summary = await self._calculate_performance_summary(portfolio_id)

            detail = PortfolioDetail(
                portfolio=portfolio,
                holdings=holdings,
                recent_transactions=transactions,
                settings=settings,
                performance_summary=performance_summary
            )

            log_info(f"포트폴리오 상세 조회 완료: {portfolio.name}", category="portfolio")
            return detail

        except Exception as e:
            log_error(f"포트폴리오 상세 조회 실패: {str(e)}", category="portfolio")
            raise

    async def update_portfolio(
        self, portfolio_id: UUID, user_id: UUID, update_data: PortfolioUpdate
    ) -> Optional[Portfolio]:
        """포트폴리오 업데이트"""
        try:
            # 업데이트할 데이터 준비
            update_dict = {}
            
            if update_data.name is not None:
                update_dict["name"] = update_data.name
            if update_data.description is not None:
                update_dict["description"] = update_data.description
            if update_data.risk_level is not None:
                update_dict["risk_level"] = update_data.risk_level.value
            if update_data.investment_goal is not None:
                update_dict["investment_goal"] = update_data.investment_goal
            if update_data.target_return is not None:
                update_dict["target_return"] = float(update_data.target_return)
            
            update_dict["updated_at"] = datetime.utcnow().isoformat()

            result = self.supabase.table("portfolios").update(update_dict).eq(
                "id", str(portfolio_id)
            ).eq("user_id", str(user_id)).execute()

            if not result.data:
                return None

            updated_portfolio = Portfolio(**result.data[0])
            log_info(f"포트폴리오 업데이트 완료: {updated_portfolio.name}", category="portfolio")
            
            return updated_portfolio

        except Exception as e:
            log_error(f"포트폴리오 업데이트 실패: {str(e)}", category="portfolio")
            raise

    async def delete_portfolio(
        self, portfolio_id: UUID, user_id: UUID
    ) -> bool:
        """포트폴리오 삭제 (소프트 삭제)"""
        try:
            result = self.supabase.table("portfolios").update({
                "is_active": False,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", str(portfolio_id)).eq("user_id", str(user_id)).execute()

            success = bool(result.data)
            if success:
                log_info(f"포트폴리오 삭제 완료: {portfolio_id}", category="portfolio")
            
            return success

        except Exception as e:
            log_error(f"포트폴리오 삭제 실패: {str(e)}", category="portfolio")
            raise

    async def add_holding(
        self, holding_data: HoldingCreate
    ) -> Holding:
        """보유 종목 추가"""
        try:
            holding_dict = {
                "id": str(uuid4()),
                "portfolio_id": str(holding_data.portfolio_id),
                "symbol": holding_data.symbol,
                "quantity": holding_data.quantity,
                "average_cost": float(holding_data.average_cost),
                "current_price": float(holding_data.average_cost),  # 초기값
                "market_value": float(holding_data.average_cost * holding_data.quantity),
                "unrealized_pnl": 0.0,
                "realized_pnl": 0.0,
                "first_purchase_date": datetime.utcnow().isoformat(),
                "last_updated": datetime.utcnow().isoformat()
            }

            result = self.supabase.table("portfolio_holdings").insert(holding_dict).execute()
            
            if not result.data:
                raise Exception("보유 종목 추가 실패")

            holding = Holding(**result.data[0])
            log_info(f"보유 종목 추가 완료: {holding.symbol}", category="portfolio")
            
            return holding

        except Exception as e:
            log_error(f"보유 종목 추가 실패: {str(e)}", category="portfolio")
            raise

    async def record_transaction(
        self, transaction_data: TransactionCreate
    ) -> Transaction:
        """거래 내역 기록"""
        try:
            total_amount = transaction_data.price * transaction_data.quantity + transaction_data.fees
            
            transaction_dict = {
                "id": str(uuid4()),
                "portfolio_id": str(transaction_data.portfolio_id),
                "symbol": transaction_data.symbol,
                "transaction_type": transaction_data.transaction_type.value,
                "quantity": transaction_data.quantity,
                "price": float(transaction_data.price),
                "fees": float(transaction_data.fees),
                "total_amount": float(total_amount),
                "executed_at": datetime.utcnow().isoformat(),
                "metadata": {}
            }

            result = self.supabase.table("portfolio_transactions").insert(transaction_dict).execute()
            
            if not result.data:
                raise Exception("거래 내역 기록 실패")

            # 포트폴리오 보유 종목 업데이트
            await self._update_holdings_after_transaction(transaction_data)
            
            transaction = Transaction(**result.data[0])
            log_info(f"거래 내역 기록 완료: {transaction.symbol} {transaction.transaction_type}", category="portfolio")
            
            return transaction

        except Exception as e:
            log_error(f"거래 내역 기록 실패: {str(e)}", category="portfolio")
            raise

    async def get_portfolio_performance(
        self, portfolio_id: UUID, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> List[Performance]:
        """포트폴리오 성과 조회"""
        try:
            query = self.supabase.table("portfolio_performance").select("*").eq(
                "portfolio_id", str(portfolio_id)
            ).order("date", desc=True)
            
            if start_date:
                query = query.gte("date", start_date.isoformat())
            if end_date:
                query = query.lte("date", end_date.isoformat())
            
            result = query.execute()
            
            performances = [Performance(**perf) for perf in result.data]
            log_info(f"성과 데이터 조회 완료: {len(performances)}개", category="portfolio")
            
            return performances

        except Exception as e:
            log_error(f"성과 데이터 조회 실패: {str(e)}", category="portfolio")
            raise

    async def _create_default_settings(self, portfolio_id: UUID):
        """기본 설정 생성"""
        try:
            settings_dict = {
                "id": str(uuid4()),
                "portfolio_id": str(portfolio_id),
                "max_position_size": 20.0,
                "max_sector_exposure": 30.0,
                "stop_loss_threshold": -10.0,
                "take_profit_threshold": 20.0,
                "rebalancing_frequency": "monthly",
                "auto_rebalancing": False,
                "notifications_enabled": True,
                "email_alerts": True
            }

            self.supabase.table("portfolio_settings").insert(settings_dict).execute()

        except Exception as e:
            log_error(f"기본 설정 생성 실패: {str(e)}", category="portfolio")
            raise

    async def _update_holdings_after_transaction(self, transaction_data: TransactionCreate):
        """거래 후 보유 종목 업데이트"""
        try:
            # 기존 보유 종목 조회
            existing_result = self.supabase.table("portfolio_holdings").select("*").eq(
                "portfolio_id", str(transaction_data.portfolio_id)
            ).eq("symbol", transaction_data.symbol).execute()

            if existing_result.data:
                # 기존 종목 업데이트
                existing_holding = existing_result.data[0]
                
                if transaction_data.transaction_type == TransactionType.BUY:
                    new_quantity = existing_holding["quantity"] + transaction_data.quantity
                    total_cost = (existing_holding["average_cost"] * existing_holding["quantity"]) + \
                                (transaction_data.price * transaction_data.quantity)
                    new_avg_cost = total_cost / new_quantity
                else:  # SELL
                    new_quantity = existing_holding["quantity"] - transaction_data.quantity
                    new_avg_cost = existing_holding["average_cost"]

                if new_quantity > 0:
                    update_dict = {
                        "quantity": new_quantity,
                        "average_cost": float(new_avg_cost),
                        "last_updated": datetime.utcnow().isoformat()
                    }
                    self.supabase.table("portfolio_holdings").update(update_dict).eq(
                        "id", existing_holding["id"]
                    ).execute()
                else:
                    # 수량이 0이면 삭제
                    self.supabase.table("portfolio_holdings").delete().eq(
                        "id", existing_holding["id"]
                    ).execute()
            else:
                # 새 종목 추가 (매수의 경우만)
                if transaction_data.transaction_type == TransactionType.BUY:
                    await self.add_holding(HoldingCreate(
                        portfolio_id=transaction_data.portfolio_id,
                        symbol=transaction_data.symbol,
                        quantity=transaction_data.quantity,
                        average_cost=transaction_data.price
                    ))

        except Exception as e:
            log_error(f"보유 종목 업데이트 실패: {str(e)}", category="portfolio")
            raise

    async def _calculate_performance_summary(self, portfolio_id: UUID) -> Dict[str, Any]:
        """성과 요약 계산"""
        try:
            # 최근 30일 성과 데이터 조회
            from datetime import timedelta
            thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).date()
            
            performances = await self.get_portfolio_performance(
                portfolio_id, start_date=thirty_days_ago
            )
            
            if not performances:
                return {}
            
            latest = performances[0]
            oldest = performances[-1] if len(performances) > 1 else latest
            
            # 수익률 계산
            period_return = ((latest.total_value - oldest.total_value) / oldest.total_value * 100) if oldest.total_value > 0 else 0
            
            return {
                "period_return": float(period_return),
                "current_value": float(latest.total_value),
                "cash_balance": float(latest.cash_balance),
                "invested_amount": float(latest.invested_amount),
                "data_points": len(performances)
            }

        except Exception as e:
            log_error(f"성과 요약 계산 실패: {str(e)}", category="portfolio")
            return {}
