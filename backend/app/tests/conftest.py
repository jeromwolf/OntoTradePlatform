"""테스트 설정 및 픽스처"""

import asyncio

import pytest
from httpx import AsyncClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import get_db
from app.main import app
from app.models.base import Base

# 테스트용 SQLite 데이터베이스 URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
TEST_SYNC_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="session")
def event_loop():
    """이벤트 루프 픽스처"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    """테스트용 비동기 데이터베이스 엔진"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def test_session(test_engine):
    """테스트용 데이터베이스 세션"""
    TestSessionLocal = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client(test_session):
    """테스트용 HTTP 클라이언트"""

    def get_test_db():
        yield test_session

    app.dependency_overrides[get_db] = get_test_db

    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """테스트용 사용자 데이터"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
    }
