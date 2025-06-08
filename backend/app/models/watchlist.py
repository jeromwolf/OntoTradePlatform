"""
관심종목 데이터베이스 모델
"""

import uuid

from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class UserWatchlist(Base):
    """사용자 관심종목 테이블"""

    __tablename__ = "user_watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    symbol = Column(String(20), nullable=False)
    name = Column(String(200), nullable=False)
    market = Column(String(50), nullable=True)  # NYSE, NASDAQ, KOSPI 등
    type = Column(String(20), nullable=True)  # Stock, ETF 등
    region = Column(String(10), nullable=True)  # US, KR 등
    currency = Column(String(5), nullable=True, default="USD")
    memo = Column(Text, nullable=True)  # 사용자 메모
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # 사용자당 같은 종목은 한 번만 등록 가능
    __table_args__ = (UniqueConstraint("user_id", "symbol", name="unique_user_symbol"),)


class UserRecentStocks(Base):
    """사용자 최근 조회 종목 테이블"""

    __tablename__ = "user_recent_stocks"

    user_id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    symbol = Column(String(20), primary_key=True, nullable=False)
    name = Column(String(200), nullable=False)
    market = Column(String(50), nullable=True)
    last_viewed = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # 복합 기본 키: user_id + symbol
