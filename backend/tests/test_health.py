import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["docs_url"] == "/docs"
    assert data["api_v1"] == "/api/v1"


@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "service" in data
    assert "database" in data


@pytest.mark.asyncio
async def test_api_v1_health_endpoint(async_client: AsyncClient):
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["api_version"] == "v1"
    assert data["status"] in ["healthy", "degraded"]


@pytest.mark.asyncio
async def test_docs_and_openapi(async_client: AsyncClient):
    docs_response = await async_client.get("/docs")
    assert docs_response.status_code == 200
    assert "swagger-ui" in docs_response.text.lower() or "html" in docs_response.text.lower()

    openapi_response = await async_client.get("/api/v1/openapi.json")
    assert openapi_response.status_code == 200
    schema = openapi_response.json()
    assert "paths" in schema
    assert "/api/v1/health" in schema["paths"]
    assert "/api/v1/student/profile" in schema["paths"]
    assert "/api/v1/quizzes/{quiz_id}" in schema["paths"]
    assert "/api/v1/ai/explanation" in schema["paths"]
    assert "/api/v1/sync" in schema["paths"]


@pytest.mark.asyncio
async def test_standard_error_format_404(async_client: AsyncClient):
    response = await async_client.get("/api/v1/nonexistent-endpoint-xyz")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "message" in data["error"]
