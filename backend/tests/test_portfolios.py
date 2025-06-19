"""
포트폴리오 관리 API 테스트
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from typing import Dict, Any
from uuid import UUID, uuid4
from datetime import datetime

from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.portfolio import PortfolioCreate, TransactionCreate, SettingsUpdate
from app.core.auth import create_access_token
from app.core.config import settings

# 테스트용 데이터베이스 설정
@pytest.fixture(scope="module")
def db():
    # 테스트용 데이터베이스 테이블 생성
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # 테스트 후 테이블 삭제
        Base.metadata.drop_all(bind=engine)

# 테스트용 사용자 토큰
@pytest.fixture(scope="module")
def test_user_token():
    # 테스트용 사용자 ID
    user_id = str(uuid4())
    token = create_access_token({"sub": user_id})
    return f"Bearer {token}"

# 테스트 클라이언트
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# 테스트용 포트폴리오 데이터
@pytest.fixture
def portfolio_data():
    return {
        "name": "테스트 포트폴리오",
        "description": "테스트용 포트폴리오입니다.",
        "initial_balance": 10000000,  # 1천만원
        "risk_level": "MODERATE",
        "rebalancing_frequency": "MONTHLY",
    }

# 테스트용 거래 데이터
@pytest.fixture
def transaction_data():
    return {
        "symbol": "005930",
        "name": "삼성전자",
        "transaction_type": "BUY",
        "quantity": 10,
        "price": 70000,  # 7만원
        "fee": 0.00015,  # 수수료 0.015%
    }


def test_create_portfolio(client: TestClient, test_user_token: str, portfolio_data: Dict[str, Any]):
    """포트폴리오 생성 테스트"""
    response = client.post(
        "/portfolios/",
        json=portfolio_data,
        headers={"Authorization": test_user_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == portfolio_data["name"]
    assert data["initial_balance"] == portfolio_data["initial_balance"]
    assert data["current_balance"] == portfolio_data["initial_balance"]
    return data["id"]

def test_get_portfolios(client: TestClient, test_user_token: str):
    """포트폴리오 목록 조회 테스트"""
    response = client.get(
        "/portfolios/",
        headers={"Authorization": test_user_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    return data

def test_get_portfolio_detail(client: TestClient, test_user_token: str, portfolio_id: str):
    """포트폴리오 상세 조회 테스트"""
    response = client.get(
        f"/portfolios/{portfolio_id}",
        headers={"Authorization": test_user_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == portfolio_id
    return data

def test_execute_trade(client: TestClient, test_user_token: str, portfolio_id: str, transaction_data: Dict[str, Any]):
    """거래 실행 테스트 (매수)"""
    response = client.post(
        f"/portfolios/{portfolio_id}/trades",
        json=transaction_data,
        headers={"Authorization": test_user_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == transaction_data["symbol"]
    assert data["transaction_type"] == transaction_data["transaction_type"]
    return data

def test_get_transaction_history(client: TestClient, test_user_token: str, portfolio_id: str):
    """거래 내역 조회 테스트"""
    response = client.get(
        f"/portfolios/{portfolio_id}/transactions",
        headers={"Authorization": test_user_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:  # 거래 내역이 있는 경우
        assert "symbol" in data[0]
        assert "transaction_type" in data[0]
    return data

def test_update_portfolio_settings(client: TestClient, test_user_token: str, portfolio_id: str):
    """포트폴리오 설정 업데이트 테스트"""
    update_data = {
        "risk_level": "AGGRESSIVE",
        "rebalancing_frequency": "QUARTERLY",
        "notifications_enabled": True,
        "notification_email": "test@example.com"
    }
    response = client.put(
        f"/portfolios/{portfolio_id}/settings",
        json=update_data,
        headers={"Authorization": test_user_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == update_data["risk_level"]
    assert data["rebalancing_frequency"] == update_data["rebalancing_frequency"]
    return data

def test_delete_portfolio(client: TestClient, test_user_token: str, portfolio_id: str):
    """포트폴리오 삭제 테스트"""
    response = client.delete(
        f"/portfolios/{portfolio_id}",
        headers={"Authorization": test_user_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == portfolio_id
    assert data["is_active"] is False
