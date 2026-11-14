import os
import sys
from typing import AsyncGenerator
import pytest
from httpx import AsyncClient, ASGITransport

# Ensure backend root is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.database import Base, engine
import app.db.models  # noqa: F401
from app.main import app


@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Ensure all registered models exist in test database prior to test execution."""
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
