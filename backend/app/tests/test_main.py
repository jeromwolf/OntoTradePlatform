"""메인 애플리케이션 테스트"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """루트 엔드포인트 테스트"""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "OntoTrade API Server"


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """헬스체크 엔드포인트 테스트"""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_api_docs_available(client: AsyncClient):
    """API 문서 접근 가능성 테스트"""
    response = await client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_openapi_json(client: AsyncClient):
    """OpenAPI JSON 스키마 테스트"""
    response = await client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data
    assert data["info"]["title"] == "OntoTrade API"
