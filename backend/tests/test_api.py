import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.db.session import get_session
from app.main import create_app

from app.models.project import Project  # noqa: F401
from app.models.subscriber import Subscriber  # noqa: F401
from app.models.update import Update  # noqa: F401

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    app = create_app()

    async def override_get_session():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_create_project(client: AsyncClient):
    response = await client.post("/projects", json={"name": "Acme Mobile"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Acme Mobile"
    assert data["slug"] == "acme-mobile"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_update(client: AsyncClient):
    project = (await client.post("/projects", json={"name": "Auth Service"})).json()

    payload = {
        "project_id": project["id"],
        "title": "Fixed login JWT issue",
        "description": "Fixed login JWT issue",
        "type": "BUGFIX",
        "release_tag": "v1.2.0",
    }
    response = await client.post("/updates", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["project_id"] == project["id"]
    assert data["type"] == "BUGFIX"
    assert data["developer_view"] == "Resolved JWT validation issue affecting authentication flow"
    assert data["customer_view"] == "Fixed an issue preventing some users from logging in"
    assert data["internal_view"] == "Root cause was token validation mismatch after recent auth changes"


@pytest.mark.asyncio
async def test_get_updates_and_public(client: AsyncClient):
    project = (await client.post("/projects", json={"name": "Billing"})).json()
    await client.post(
        "/updates",
        json={
            "project_id": project["id"],
            "title": "Faster invoice export",
            "description": "Optimized CSV export path",
            "type": "IMPROVEMENT",
        },
    )
    await client.post(
        "/updates",
        json={
            "project_id": project["id"],
            "title": "Add webhooks",
            "description": "Added outbound webhook events",
            "type": "FEATURE",
        },
    )

    response = await client.get("/updates", params={"project_id": project["id"]})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2

    filtered = await client.get(
        "/updates",
        params={"project_id": project["id"], "type": "FEATURE"},
    )
    assert filtered.status_code == 200
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["type"] == "FEATURE"

    public = await client.get(f"/public/{project['slug']}")
    assert public.status_code == 200
    pub = public.json()
    assert pub["project_name"] == "Billing"
    assert pub["project_slug"] == "billing"
    assert "developer_view" not in pub["items"][0]
    assert "customer_view" in pub["items"][0]


@pytest.mark.asyncio
async def test_subscribe_and_rss(client: AsyncClient):
    project = (await client.post("/projects", json={"name": "Docs"})).json()
    sub = await client.post(
        "/subscribe",
        json={"project_slug": project["slug"], "email": "dev@example.com"},
    )
    assert sub.status_code == 201
    assert sub.json()["email"] == "dev@example.com"

    dup = await client.post(
        "/subscribe",
        json={"project_slug": project["slug"], "email": "dev@example.com"},
    )
    assert dup.status_code == 409

    feed = await client.get(f"/feed/{project['slug']}.xml")
    assert feed.status_code == 200
    assert "application/rss+xml" in feed.headers["content-type"]
    assert "Docs Changelog" in feed.text


@pytest.mark.asyncio
async def test_from_commit(client: AsyncClient):
    project = (await client.post("/projects", json={"name": "API"})).json()
    response = await client.post(
        "/updates/from-commit",
        json={
            "project_id": project["id"],
            "commit_message": "feat(auth): add magic link login\n\nUsers can sign in via email link.",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "FEATURE"
    assert data["commit_source"].startswith("feat(auth)")
