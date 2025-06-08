"""
시뮬레이션 관련 Pydantic 모델
OntoTradePlatform - Simulation Module
"""

from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class TransactionType(str, Enum):
    """거래 유형"""
    BUY = "BUY"
    SELL = "SELL"


# 기본 모델들
class SimulationSessionBase(BaseModel):
    """시뮬레이션 세션 기본 모델"""
    session_name: str = Field(default="기본 시뮬레이션", max_length=100)
    initial_cash: Decimal = Field(default=Decimal("100000000.00"), ge=0)  # 1억원 시작 자금
    current_cash: Decimal = Field(default=Decimal("100000000.00"), ge=0)  # 1억원 현재 현금
    total_value: Decimal = Field(default=Decimal("100000000.00"), ge=0)   # 1억원 총 자산
    total_pnl: Decimal = Field(default=Decimal("0.00"))
    total_pnl_percent: Decimal = Field(default=Decimal("0.00"))
    is_active: bool = Field(default=True)


class SimulationHoldingBase(BaseModel):
    """시뮬레이션 보유종목 기본 모델"""
    symbol: str = Field(..., max_length=10)
    company_name: Optional[str] = Field(None, max_length=100)
    quantity: int = Field(..., ge=0)
    avg_price: Decimal = Field(..., gt=0)
    current_price: Optional[Decimal] = Field(None, gt=0)
    market_value: Optional[Decimal] = Field(None, ge=0)
    unrealized_pnl: Decimal = Field(default=Decimal("0.00"))
    unrealized_pnl_percent: Decimal = Field(default=Decimal("0.00"))
    first_bought_date: Optional[datetime] = None  # 최초 매수일
    last_transaction_date: Optional[datetime] = None  # 마지막 거래일
    total_bought_quantity: int = Field(default=0, ge=0)  # 총 매수 수량
    total_sold_quantity: int = Field(default=0, ge=0)  # 총 매도 수량
    avg_buy_price: Optional[Decimal] = Field(None, gt=0)  # 평균 매수가
    realized_pnl: Decimal = Field(default=Decimal("0.00"))  # 실현 손익


class SimulationTransactionBase(BaseModel):
    """시뮬레이션 거래내역 기본 모델"""
    symbol: str = Field(..., max_length=10)
    company_name: Optional[str] = Field(None, max_length=100)
    transaction_type: TransactionType
    quantity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    total_amount: Decimal = Field(..., gt=0)
    commission: Decimal = Field(default=Decimal("0.00"), ge=0)
    net_amount: Decimal = Field(..., gt=0)
    cash_before: Decimal = Field(..., ge=0)
    cash_after: Decimal = Field(..., ge=0)
    notes: Optional[str] = None


class SimulationPerformanceBase(BaseModel):
    """시뮬레이션 성과 기본 모델"""
    performance_date: date
    cash_balance: Decimal = Field(..., ge=0)
    holdings_value: Decimal = Field(..., ge=0)
    total_value: Decimal = Field(..., ge=0)
    daily_pnl: Decimal = Field(...)
    daily_pnl_percent: Decimal = Field(...)
    cumulative_pnl: Decimal = Field(...)
    cumulative_pnl_percent: Decimal = Field(...)
    num_positions: int = Field(default=0, ge=0)


# 생성 모델들
class SimulationSessionCreate(SimulationSessionBase):
    """시뮬레이션 세션 생성 모델"""
    pass


class SimulationHoldingCreate(SimulationHoldingBase):
    """시뮬레이션 보유종목 생성 모델"""
    session_id: UUID


class SimulationTransactionCreate(SimulationTransactionBase):
    """시뮬레이션 거래내역 생성 모델"""
    session_id: UUID


class SimulationPerformanceCreate(SimulationPerformanceBase):
    """시뮬레이션 성과 생성 모델"""
    session_id: UUID


# 업데이트 모델들
class SimulationSessionUpdate(BaseModel):
    """시뮬레이션 세션 업데이트 모델"""
    session_name: Optional[str] = Field(None, max_length=100)
    current_cash: Optional[Decimal] = Field(None, ge=0)
    total_value: Optional[Decimal] = Field(None, ge=0)
    total_pnl: Optional[Decimal] = None
    total_pnl_percent: Optional[Decimal] = None
    is_active: Optional[bool] = None


class SimulationHoldingUpdate(BaseModel):
    """시뮬레이션 보유종목 업데이트 모델"""
    quantity: Optional[int] = Field(None, ge=0)
    avg_price: Optional[Decimal] = Field(None, gt=0)
    current_price: Optional[Decimal] = Field(None, gt=0)
    market_value: Optional[Decimal] = Field(None, ge=0)
    unrealized_pnl: Optional[Decimal] = None
    unrealized_pnl_percent: Optional[Decimal] = None
    last_transaction_date: Optional[datetime] = None
    total_bought_quantity: Optional[int] = Field(None, ge=0)
    total_sold_quantity: Optional[int] = Field(None, ge=0)
    avg_buy_price: Optional[Decimal] = Field(None, gt=0)
    realized_pnl: Optional[Decimal] = None


# 응답 모델들
class SimulationSession(SimulationSessionBase):
    """시뮬레이션 세션 응답 모델"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SimulationHolding(SimulationHoldingBase):
    """시뮬레이션 보유종목 응답 모델"""
    id: UUID
    session_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SimulationTransaction(SimulationTransactionBase):
    """시뮬레이션 거래내역 응답 모델"""
    id: UUID
    session_id: UUID
    executed_at: datetime

    class Config:
        from_attributes = True


class SimulationPerformance(SimulationPerformanceBase):
    """시뮬레이션 성과 응답 모델"""
    id: UUID
    session_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# 복합 응답 모델들
class SimulationSessionDetail(SimulationSession):
    """상세 시뮬레이션 세션 정보"""
    holdings: List[SimulationHolding] = []
    recent_transactions: List[SimulationTransaction] = []


class SimulationLeaderboard(BaseModel):
    """시뮬레이션 리더보드 모델"""
    session_id: UUID
    user_email: str
    session_name: str
    total_value: Decimal
    total_pnl: Decimal
    total_pnl_percent: Decimal
    num_positions: int
    num_transactions: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# 거래 요청 모델
class TradeRequest(BaseModel):
    """거래 요청 모델"""
    symbol: str = Field(..., max_length=10)
    transaction_type: TransactionType
    quantity: int = Field(..., gt=0)
    
    @validator('symbol')
    def validate_symbol(cls, v):
        return v.upper().strip()


class TradeResponse(BaseModel):
    """거래 응답 모델"""
    success: bool
    message: str
    transaction: Optional[SimulationTransaction] = None
    updated_session: Optional[SimulationSession] = None


# 통계 모델
class SimulationStats(BaseModel):
    """시뮬레이션 통계 모델"""
    total_sessions: int
    active_sessions: int
    total_transactions: int
    total_volume: Decimal
    average_return: Decimal
    top_performers: List[SimulationLeaderboard]


class PortfolioSummary(BaseModel):
    """포트폴리오 요약 모델"""
    session: SimulationSession
    holdings: List[SimulationHolding]
    total_invested: Decimal
    total_market_value: Decimal
    cash_percentage: float
    holdings_percentage: float
    daily_change: Decimal
    daily_change_percent: Decimal
