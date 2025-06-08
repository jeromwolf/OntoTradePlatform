"""
포트폴리오 관리 시스템 데이터 모델
OntoTradePlatform - Task 5.1
"""

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class RiskLevel(str, Enum):
    """위험 수준 열거형"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TransactionType(str, Enum):
    """거래 유형 열거형"""

    BUY = "buy"
    SELL = "sell"


class RebalancingFrequency(str, Enum):
    """리밸런싱 주기 열거형"""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"


# Portfolio Models
class PortfolioBase(BaseModel):
    """포트폴리오 기본 모델"""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    initial_balance: Decimal = Field(default=Decimal("1000000.00"), gt=0)
    risk_level: RiskLevel = RiskLevel.MEDIUM
    investment_goal: Optional[str] = None
    target_return: Optional[Decimal] = Field(None, ge=0, le=100)


class PortfolioCreate(PortfolioBase):
    """포트폴리오 생성 모델"""

    pass


class PortfolioUpdate(BaseModel):
    """포트폴리오 업데이트 모델"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    investment_goal: Optional[str] = None
    target_return: Optional[Decimal] = Field(None, ge=0, le=100)


class Portfolio(PortfolioBase):
    """포트폴리오 응답 모델"""

    id: UUID
    user_id: UUID
    current_balance: Decimal
    total_value: Decimal
    created_at: datetime
    updated_at: datetime
    is_active: bool
    metadata: Dict[str, Any] = {}

    class Config:
        from_attributes = True


# Holdings Models
class HoldingBase(BaseModel):
    """보유 종목 기본 모델"""

    symbol: str = Field(..., min_length=1, max_length=20)
    quantity: int = Field(..., ge=0)
    average_cost: Decimal = Field(..., gt=0)


class HoldingCreate(HoldingBase):
    """보유 종목 생성 모델"""

    portfolio_id: UUID


class HoldingUpdate(BaseModel):
    """보유 종목 업데이트 모델"""

    quantity: Optional[int] = Field(None, ge=0)
    current_price: Optional[Decimal] = Field(None, gt=0)


class Holding(HoldingBase):
    """보유 종목 응답 모델"""

    id: UUID
    portfolio_id: UUID
    current_price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    unrealized_pnl: Optional[Decimal] = None
    realized_pnl: Decimal = Decimal("0.00")
    first_purchase_date: datetime
    last_updated: datetime

    class Config:
        from_attributes = True


# Transaction Models
class TransactionBase(BaseModel):
    """거래 내역 기본 모델"""

    symbol: str = Field(..., min_length=1, max_length=20)
    transaction_type: TransactionType
    quantity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    fees: Decimal = Field(default=Decimal("0.00"), ge=0)


class TransactionCreate(TransactionBase):
    """거래 내역 생성 모델"""

    portfolio_id: UUID


class Transaction(TransactionBase):
    """거래 내역 응답 모델"""

    id: UUID
    portfolio_id: UUID
    total_amount: Decimal
    executed_at: datetime
    order_id: Optional[UUID] = None
    metadata: Dict[str, Any] = {}

    class Config:
        from_attributes = True


# Performance Models
class PerformanceBase(BaseModel):
    """성과 기본 모델"""

    date: date
    total_value: Decimal = Field(..., ge=0)
    cash_balance: Decimal = Field(..., ge=0)
    invested_amount: Decimal = Field(..., ge=0)


class PerformanceCreate(PerformanceBase):
    """성과 생성 모델"""

    portfolio_id: UUID
    daily_return: Optional[Decimal] = None
    cumulative_return: Optional[Decimal] = None
    benchmark_return: Optional[Decimal] = None
    volatility: Optional[Decimal] = None


class Performance(PerformanceBase):
    """성과 응답 모델"""

    id: UUID
    portfolio_id: UUID
    daily_return: Optional[Decimal] = None
    cumulative_return: Optional[Decimal] = None
    benchmark_return: Optional[Decimal] = None
    volatility: Optional[Decimal] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Settings Models
class SettingsBase(BaseModel):
    """설정 기본 모델"""

    max_position_size: Decimal = Field(default=Decimal("20.00"), gt=0, le=100)
    max_sector_exposure: Decimal = Field(default=Decimal("30.00"), gt=0, le=100)
    stop_loss_threshold: Decimal = Field(default=Decimal("-10.00"), lt=0)
    take_profit_threshold: Decimal = Field(default=Decimal("20.00"), gt=0)
    rebalancing_frequency: RebalancingFrequency = RebalancingFrequency.MONTHLY
    auto_rebalancing: bool = False
    notifications_enabled: bool = True
    email_alerts: bool = True


class SettingsCreate(SettingsBase):
    """설정 생성 모델"""

    portfolio_id: UUID


class SettingsUpdate(BaseModel):
    """설정 업데이트 모델"""

    max_position_size: Optional[Decimal] = Field(None, gt=0, le=100)
    max_sector_exposure: Optional[Decimal] = Field(None, gt=0, le=100)
    stop_loss_threshold: Optional[Decimal] = Field(None, lt=0)
    take_profit_threshold: Optional[Decimal] = Field(None, gt=0)
    rebalancing_frequency: Optional[RebalancingFrequency] = None
    auto_rebalancing: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    email_alerts: Optional[bool] = None


class Settings(SettingsBase):
    """설정 응답 모델"""

    id: UUID
    portfolio_id: UUID

    class Config:
        from_attributes = True


# Response Models
class PortfolioSummary(BaseModel):
    """포트폴리오 요약 정보"""

    portfolio: Portfolio
    holdings_count: int
    total_invested: Decimal
    total_return: Decimal
    return_percentage: Decimal
    top_holdings: List[Holding]


class PortfolioDetail(BaseModel):
    """포트폴리오 상세 정보"""

    portfolio: Portfolio
    holdings: List[Holding]
    recent_transactions: List[Transaction]
    settings: Optional[Settings] = None
    performance_summary: Dict[str, Any] = {}


class PortfolioStats(BaseModel):
    """포트폴리오 통계"""

    total_portfolios: int
    total_value: Decimal
    total_return: Decimal
    best_performing: Optional[Portfolio] = None
    worst_performing: Optional[Portfolio] = None
    avg_return: Decimal


# Order Models (for future implementation)
class OrderType(str, Enum):
    """주문 유형"""

    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"


class OrderStatus(str, Enum):
    """주문 상태"""

    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class OrderBase(BaseModel):
    """주문 기본 모델"""

    portfolio_id: UUID
    symbol: str = Field(..., min_length=1, max_length=20)
    order_type: OrderType
    transaction_type: TransactionType
    quantity: int = Field(..., gt=0)
    price: Optional[Decimal] = Field(None, gt=0)
    stop_price: Optional[Decimal] = Field(None, gt=0)


class OrderCreate(OrderBase):
    """주문 생성 모델"""

    pass


class Order(OrderBase):
    """주문 응답 모델"""

    id: UUID
    status: OrderStatus
    filled_quantity: int = 0
    avg_fill_price: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
