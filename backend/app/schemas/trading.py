from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from uuid import UUID

class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class OrderCreate(BaseModel):
    symbol: str = Field(..., description="주식 심볼 (예: AAPL, 005930.KS)")
    order_type: OrderType = Field(..., description="주문 유형 (시장가, 지정가 등)")
    side: OrderSide = Field(..., description="매수/매도")
    quantity: float = Field(..., gt=0, description="주문 수량")
    price: Optional[float] = Field(None, gt=0, description="지정가 (지정가 주문인 경우 필수)")
    stop_price: Optional[float] = Field(None, gt=0, description="스탑 가격 (스탑 주문인 경우 필수)")

    @validator('price')
    def validate_price(cls, v, values):
        if values.get('order_type') in [OrderType.LIMIT, OrderType.STOP_LIMIT] and v is None:
            raise ValueError("지정가 주문에는 가격이 필수입니다.")
        if values.get('order_type') == OrderType.STOP and v is not None:
            raise ValueError("스탑 주문에는 가격을 지정할 수 없습니다.")
        return v

    @validator('stop_price')
    def validate_stop_price(cls, v, values):
        if values.get('order_type') in [OrderType.STOP, OrderType.STOP_LIMIT] and v is None:
            raise ValueError("스탑 주문에는 스탑 가격이 필수입니다.")
        return v

class Order(OrderCreate):
    id: UUID
    user_id: UUID
    portfolio_id: UUID
    status: OrderStatus
    filled_quantity: float = 0.0
    avg_fill_price: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    filled_quantity: Optional[float] = None
    avg_fill_price: Optional[float] = None

class Trade(BaseModel):
    id: UUID
    order_id: UUID
    quantity: float
    price: float
    fee: float
    created_at: datetime

    class Config:
        orm_mode = True

class OrderBookEntry(BaseModel):
    price: float
    quantity: float

class OrderBook(BaseModel):
    symbol: str
    bids: List[OrderBookEntry]
    asks: List[OrderBookEntry]
    timestamp: datetime
