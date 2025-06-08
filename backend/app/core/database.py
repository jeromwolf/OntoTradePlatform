"""
데이터베이스 설정
Supabase PostgreSQL 연결
"""

import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv("ASYNC_DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("ASYNC_DATABASE_URL 환경 변수가 설정되지 않았습니다.")

# 비동기 엔진 생성
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # 운영환경에서는 False
    pool_pre_ping=True,
    pool_recycle=3600,
)

# 비동기 세션 팩토리
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Base 클래스
Base = declarative_base()


async def get_db():
    """데이터베이스 세션 의존성"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
