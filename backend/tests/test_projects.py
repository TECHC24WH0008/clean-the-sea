"""回収プロジェクトAPIエンドポイントのテスト (要件 9.1, 9.2, 9.3)"""

from datetime import date
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models import RecoveryProject


def _override_get_db(mock_db):
    def override():
        yield mock_db

    app.dependency_overrides[get_db] = override


def _cleanup_overrides():
    app.dependency_overrides.clear()


class TestGetProjects:
    """GET /api/projects のテスト"""

    def setup_method(self):
        _cleanup_overrides()

    def teardown_method(self):
        _cleanup_overrides()

    def test_returns_project_list(self):
        """プロジェクト一覧を正しく返却する"""
        p1 = RecoveryProject(
            id=1,
            location_name="東京湾",
            recovered_tons=12.5,
            photo_url="https://example.com/photo1.jpg",
            description="東京湾の清掃プロジェクト",
            conducted_at=date(2024, 3, 15),
        )
        p2 = RecoveryProject(
            id=2,
            location_name="大阪湾",
            recovered_tons=8.3,
            photo_url="https://example.com/photo2.jpg",
            description=None,
            conducted_at=date(2024, 4, 20),
        )

        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.all.return_value = [p1, p2]

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/projects")

        assert response.status_code == 200
        body = response.json()
        assert len(body["projects"]) == 2

        proj0 = body["projects"][0]
        assert proj0["id"] == 1
        assert proj0["location_name"] == "東京湾"
        assert proj0["recovered_tons"] == 12.5
        assert proj0["photo_url"] == "https://example.com/photo1.jpg"
        assert proj0["conducted_at"] == "2024-03-15"

        proj1 = body["projects"][1]
        assert proj1["id"] == 2
        assert proj1["location_name"] == "大阪湾"

    def test_returns_empty_list_when_no_projects(self):
        """プロジェクトが存在しない場合、空リストを返す"""
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.all.return_value = []

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/projects")

        assert response.status_code == 200
        assert response.json()["projects"] == []


class TestGetProjectDetail:
    """GET /api/projects/{project_id} のテスト"""

    def setup_method(self):
        _cleanup_overrides()

    def teardown_method(self):
        _cleanup_overrides()

    def test_returns_project_detail(self):
        """プロジェクト詳細を正しく返却する"""
        project = RecoveryProject(
            id=1,
            location_name="東京湾",
            recovered_tons=12.5,
            photo_url="https://example.com/photo1.jpg",
            description="東京湾の大規模清掃プロジェクト",
            conducted_at=date(2024, 3, 15),
        )

        mock_db = MagicMock()
        mock_db.get.return_value = project

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/projects/1")

        assert response.status_code == 200
        body = response.json()
        assert body["id"] == 1
        assert body["location_name"] == "東京湾"
        assert body["recovered_tons"] == 12.5
        assert body["photo_url"] == "https://example.com/photo1.jpg"
        assert body["conducted_at"] == "2024-03-15"
        assert body["description"] == "東京湾の大規模清掃プロジェクト"

    def test_returns_project_with_null_description(self):
        """descriptionがnullのプロジェクトを正しく返却する"""
        project = RecoveryProject(
            id=2,
            location_name="大阪湾",
            recovered_tons=8.3,
            photo_url="https://example.com/photo2.jpg",
            description=None,
            conducted_at=date(2024, 4, 20),
        )

        mock_db = MagicMock()
        mock_db.get.return_value = project

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/projects/2")

        assert response.status_code == 200
        body = response.json()
        assert body["description"] is None

    def test_returns_404_for_nonexistent_project(self):
        """存在しないproject_idの場合、404を返す"""
        mock_db = MagicMock()
        mock_db.get.return_value = None

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/projects/999")

        assert response.status_code == 404
        assert response.json()["detail"] == "指定されたプロジェクトが見つかりません。"
