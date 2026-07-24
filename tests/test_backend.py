"""
Integration tests for the backend API.
Run with: pytest tests/ -v
"""
import pytest
import httpx

BASE_URL = "http://localhost:8000"


@pytest.fixture
def client():
    return httpx.Client(base_url=BASE_URL, timeout=30)


class TestHealth:
    def test_health_check(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"


class TestAuth:
    def test_signup(self, client):
        r = client.post("/api/auth/signup", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        })
        assert r.status_code in (201, 400)  # 400 if already exists

    def test_login(self, client):
        # Ensure user exists first
        client.post("/api/auth/signup", json={
            "username": "logintest",
            "email": "logintest@example.com",
            "password": "testpass123"
        })
        r = client.post("/api/auth/login", json={
            "email": "logintest@example.com",
            "password": "testpass123"
        })
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, client):
        r = client.post("/api/auth/login", json={
            "email": "logintest@example.com",
            "password": "wrongpassword"
        })
        assert r.status_code == 401


class TestPrompts:
    def _get_token(self, client):
        client.post("/api/auth/signup", json={
            "username": "prompttest",
            "email": "prompttest@example.com",
            "password": "testpass123"
        })
        r = client.post("/api/auth/login", json={
            "email": "prompttest@example.com",
            "password": "testpass123"
        })
        return r.json().get("access_token")

    def test_create_prompt(self, client):
        r = client.post("/api/prompts/", json={
            "title": "Test Prompt",
            "content": "This is a test prompt for {{variable}}",
            "category": "General"
        })
        assert r.status_code == 201
        data = r.json()
        assert data["title"] == "Test Prompt"
        assert data["version_number"] == 1

    def test_list_prompts(self, client):
        r = client.get("/api/prompts/")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert "total" in data

    def test_get_categories(self, client):
        r = client.get("/api/prompts/categories/list")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_delete_prompt(self, client):
        # Create then delete
        create = client.post("/api/prompts/", json={
            "title": "To Delete",
            "content": "Delete me",
        })
        pid = create.json()["id"]
        r = client.delete(f"/api/prompts/{pid}")
        assert r.status_code == 204


class TestPlayground:
    def test_list_models(self, client):
        r = client.get("/api/playground/models")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) > 0

    def test_list_providers(self, client):
        r = client.get("/api/playground/providers")
        assert r.status_code == 200
        providers = r.json()
        names = [p["provider"] for p in providers]
        assert "openai" in names
        assert "gemini" in names


class TestAnalytics:
    def test_dashboard(self, client):
        r = client.get("/api/analytics/dashboard")
        assert r.status_code == 200
        data = r.json()
        assert "total_prompts" in data
        assert "evaluation_stats" in data
