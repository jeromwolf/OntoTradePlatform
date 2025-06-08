"""
거래 처리 서비스
OntoTradePlatform - Task 5.2
"""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client

from app.core.logging_system import log_api_call
from app.core.supabase import get_supabase_client
from app.models.portfolio import (
    Holding,
    HoldingCreate,
    HoldingUpdate,
    Transaction,
    TransactionCreate,
    TransactionType,
)


class TradingService:
    """거래 처리 서비스"""

    def __init__(self):
        self.supabase: Client = get_supabase_client()

    async def execute_trade(
        self, user_id: UUID, transaction_data: TransactionCreate
    ) -> Dict[str, Any]:
        """거래 실행"""
        try:
            # 포트폴리오 유효성 검증
            portfolio = await self._validate_portfolio(
                transaction_data.portfolio_id, user_id
            )

            if not portfolio:
                raise ValueError("유효하지 않은 포트폴리오입니다")

            # 거래 가능성 검증
            trade_validation = await self._validate_trade(transaction_data, portfolio)
            if not trade_validation["valid"]:
                raise ValueError(trade_validation["error"])

            # 거래 실행
            if transaction_data.transaction_type == TransactionType.BUY:
                result = await self._execute_buy_order(transaction_data, portfolio)
            else:
                result = await self._execute_sell_order(transaction_data, portfolio)

            log_api_call(
                "trading_service",
                "execute_trade",
                {
                    "user_id": str(user_id),
                    "portfolio_id": str(transaction_data.portfolio_id),
                    "symbol": transaction_data.symbol,
                    "type": transaction_data.transaction_type.value,
                    "quantity": transaction_data.quantity,
                    "price": float(transaction_data.price),
                },
                success=True,
            )

            return result

        except Exception as e:
            log_api_call(
                "trading_service",
                "execute_trade",
                {"user_id": str(user_id), "error": str(e)},
                success=False,
            )
            raise

    async def _validate_portfolio(
        self, portfolio_id: UUID, user_id: UUID
    ) -> Optional[Dict]:
        """포트폴리오 유효성 검증"""
        result = (
            self.supabase.table("portfolios")
            .select("*")
            .eq("id", str(portfolio_id))
            .eq("user_id", str(user_id))
            .eq("is_active", True)
            .single()
            .execute()
        )

        return result.data

    async def _validate_trade(
        self, transaction_data: TransactionCreate, portfolio: Dict
    ) -> Dict[str, Any]:
        """거래 유효성 검증"""
        total_cost = (
            transaction_data.quantity * transaction_data.price + transaction_data.fees
        )
        current_balance = Decimal(str(portfolio["current_balance"]))

        if transaction_data.transaction_type == TransactionType.BUY:
            if total_cost > current_balance:
                return {"valid": False, "error": "잔고가 부족합니다"}
        else:  # SELL
            # 보유 수량 확인
            holding = await self._get_holding(
                transaction_data.portfolio_id, transaction_data.symbol
            )
            if not holding or holding["quantity"] < transaction_data.quantity:
                return {"valid": False, "error": "보유 수량이 부족합니다"}

        return {"valid": True}

    async def _execute_buy_order(
        self, transaction_data: TransactionCreate, portfolio: Dict
    ) -> Dict[str, Any]:
        """매수 주문 실행"""
        total_cost = (
            transaction_data.quantity * transaction_data.price + transaction_data.fees
        )

        # 거래 내역 기록
        transaction_dict = {
            "portfolio_id": str(transaction_data.portfolio_id),
            "symbol": transaction_data.symbol,
            "transaction_type": transaction_data.transaction_type.value,
            "quantity": transaction_data.quantity,
            "price": float(transaction_data.price),
            "fees": float(transaction_data.fees),
            "total_amount": float(total_cost),
            "executed_at": datetime.utcnow().isoformat(),
            "metadata": {},
        }

        tx_result = (
            self.supabase.table("portfolio_transactions")
            .insert(transaction_dict)
            .execute()
        )

        # 보유 종목 업데이트
        await self._update_holding_buy(transaction_data)

        # 포트폴리오 잔고 업데이트
        new_balance = Decimal(str(portfolio["current_balance"])) - total_cost
        await self._update_portfolio_balance(transaction_data.portfolio_id, new_balance)

        return {
            "success": True,
            "message": f"{transaction_data.symbol} {transaction_data.quantity}주 매수 완료",
            "transaction_id": tx_result.data[0]["id"],
            "total_cost": float(total_cost),
            "new_balance": float(new_balance),
        }

    async def _execute_sell_order(
        self, transaction_data: TransactionCreate, portfolio: Dict
    ) -> Dict[str, Any]:
        """매도 주문 실행"""
        total_proceeds = (
            transaction_data.quantity * transaction_data.price
        ) - transaction_data.fees

        # 거래 내역 기록
        transaction_dict = {
            "portfolio_id": str(transaction_data.portfolio_id),
            "symbol": transaction_data.symbol,
            "transaction_type": transaction_data.transaction_type.value,
            "quantity": transaction_data.quantity,
            "price": float(transaction_data.price),
            "fees": float(transaction_data.fees),
            "total_amount": float(total_proceeds),
            "executed_at": datetime.utcnow().isoformat(),
            "metadata": {},
        }

        tx_result = (
            self.supabase.table("portfolio_transactions")
            .insert(transaction_dict)
            .execute()
        )

        # 보유 종목 업데이트
        await self._update_holding_sell(transaction_data)

        # 포트폴리오 잔고 업데이트
        new_balance = Decimal(str(portfolio["current_balance"])) + total_proceeds
        await self._update_portfolio_balance(transaction_data.portfolio_id, new_balance)

        return {
            "success": True,
            "message": f"{transaction_data.symbol} {transaction_data.quantity}주 매도 완료",
            "transaction_id": tx_result.data[0]["id"],
            "total_proceeds": float(total_proceeds),
            "new_balance": float(new_balance),
        }

    async def _get_holding(self, portfolio_id: UUID, symbol: str) -> Optional[Dict]:
        """보유 종목 조회"""
        result = (
            self.supabase.table("portfolio_holdings")
            .select("*")
            .eq("portfolio_id", str(portfolio_id))
            .eq("symbol", symbol)
            .execute()
        )

        return result.data[0] if result.data else None

    async def _update_holding_buy(self, transaction_data: TransactionCreate):
        """매수 시 보유 종목 업데이트"""
        existing_holding = await self._get_holding(
            transaction_data.portfolio_id, transaction_data.symbol
        )

        if existing_holding:
            # 기존 보유 종목 업데이트 (평균 단가 재계산)
            old_quantity = existing_holding["quantity"]
            old_cost = Decimal(str(existing_holding["average_cost"]))
            new_quantity = old_quantity + transaction_data.quantity
            new_avg_cost = (
                (old_quantity * old_cost)
                + (transaction_data.quantity * transaction_data.price)
            ) / new_quantity

            self.supabase.table("portfolio_holdings").update(
                {
                    "quantity": new_quantity,
                    "average_cost": float(new_avg_cost),
                    "last_updated": datetime.utcnow().isoformat(),
                }
            ).eq("id", existing_holding["id"]).execute()
        else:
            # 새 보유 종목 생성
            holding_dict = {
                "portfolio_id": str(transaction_data.portfolio_id),
                "symbol": transaction_data.symbol,
                "quantity": transaction_data.quantity,
                "average_cost": float(transaction_data.price),
                "current_price": float(transaction_data.price),
                "realized_pnl": 0.0,
                "first_purchase_date": datetime.utcnow().isoformat(),
                "last_updated": datetime.utcnow().isoformat(),
            }

            self.supabase.table("portfolio_holdings").insert(holding_dict).execute()

    async def _update_holding_sell(self, transaction_data: TransactionCreate):
        """매도 시 보유 종목 업데이트"""
        existing_holding = await self._get_holding(
            transaction_data.portfolio_id, transaction_data.symbol
        )

        if existing_holding:
            new_quantity = existing_holding["quantity"] - transaction_data.quantity

            # 실현 손익 계산
            avg_cost = Decimal(str(existing_holding["average_cost"]))
            realized_pnl = (
                transaction_data.price - avg_cost
            ) * transaction_data.quantity

            if new_quantity == 0:
                # 전량 매도 시 보유 종목 삭제
                self.supabase.table("portfolio_holdings").delete().eq(
                    "id", existing_holding["id"]
                ).execute()
            else:
                # 부분 매도 시 수량 업데이트
                self.supabase.table("portfolio_holdings").update(
                    {
                        "quantity": new_quantity,
                        "realized_pnl": float(
                            Decimal(str(existing_holding["realized_pnl"]))
                            + realized_pnl
                        ),
                        "last_updated": datetime.utcnow().isoformat(),
                    }
                ).eq("id", existing_holding["id"]).execute()

    async def _update_portfolio_balance(self, portfolio_id: UUID, new_balance: Decimal):
        """포트폴리오 잔고 업데이트"""
        self.supabase.table("portfolios").update(
            {
                "current_balance": float(new_balance),
                "updated_at": datetime.utcnow().isoformat(),
            }
        ).eq("id", str(portfolio_id)).execute()

    async def get_transaction_history(
        self, portfolio_id: UUID, user_id: UUID, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """거래 내역 조회"""
        try:
            # 포트폴리오 유효성 검증
            portfolio = await self._validate_portfolio(portfolio_id, user_id)
            if not portfolio:
                raise ValueError("유효하지 않은 포트폴리오입니다")

            result = (
                self.supabase.table("portfolio_transactions")
                .select("*")
                .eq("portfolio_id", str(portfolio_id))
                .order("executed_at", desc=True)
                .limit(limit)
                .execute()
            )

            log_api_call(
                "trading_service",
                "get_transaction_history",
                {
                    "portfolio_id": str(portfolio_id),
                    "user_id": str(user_id),
                    "count": len(result.data),
                },
                success=True,
            )

            return result.data

        except Exception as e:
            log_api_call(
                "trading_service",
                "get_transaction_history",
                {"portfolio_id": str(portfolio_id), "error": str(e)},
                success=False,
            )
            raise
