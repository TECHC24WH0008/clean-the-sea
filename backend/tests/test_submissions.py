"""データ投稿エンドポイントのテスト (要件 4.3, 4.4, 4.7, 8.1)"""

import io
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import Contributor
from app.routers.submissions import calculate_points


@pytest.fixture
def client():
    return TestClient(app)


# --- ポイント計算ロジックのユニットテスト ---


def test_calculate_points_without_photo():
    """写真なしの場合、基本10ポイントを返す"""
    assert calculate_points(has_photo=False) == 10


def test_calculate_points_with_photo():
    """写真ありの場合、15ポイント（基本10 + 写真ボーナス5）を返す"""
    assert calculate_points(has_photo=True) == 15


# --- エンドポイントのテスト（DBモック使用） ---


def _make_mock_db(contributor=None):
    """モックDBセッションを作成するヘルパー"""
    db = MagicMock()
    db.get.return_value = contributor

    def flush_side_effect():
        # submission.id をシミュレート
        for call in db.add.call_args_list:
            obj = call[0][0]
            if hasattr(obj, "id") and obj.id is None:
                obj.id = 1

    db.flush.side_effect = flush_side_effect
    return db


def _override_get_db(mock_db):
    """get_db依存関係をオーバーライドするヘルパー"""
    from app.database import get_db

    def override():
        yield mock_db

    app.dependency_overrides[get_db] = override


def _cleanup_overrides():
    app.dependency_overrides.clear()


class TestCreateSubmission:
    """POST /api/submissions のテスト"""

    def setup_method(self):
        _cleanup_overrides()

    def teardown_method(self):
        _cleanup_overrides()

    def test_submission_without_photo_returns_10_points(self):
        """写真なし投稿で10ポイント獲得"""
        contributor = Contributor(id="user1", name="user1", total_points=0)
        mock_db = _make_mock_db(contributor=contributor)
        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.post(
            "/api/submissions",
            data={
                "latitude": "35.6762",
                "longitude": "139.6503",
                "density": "medium",
                "contributor_id": "user1",
            },
        )

        assert response.status_code == 201
        body = response.json()
        assert body["points_earned"] == 10
        assert body["total_points"] == 10
        assert "id" in body

    def test_submission_with_photo_returns_15_points(self):
        """写真付き投稿で15ポイント獲得"""
        contributor = Contributor(id="user2", name="user2", total_points=20)
        mock_db = _make_mock_db(contributor=contributor)
        _override_get_db(mock_db)

        client = TestClient(app)
        photo = io.BytesIO(b"fake image data")
        response = client.post(
            "/api/submissions",
            data={
                "latitude": "34.0522",
                "longitude": "-118.2437",
                "density": "high",
                "contributor_id": "user2",
            },
            files={"photo": ("test.jpg", photo, "image/jpeg")},
        )

        assert response.status_code == 201
        body = response.json()
        assert body["points_earned"] == 15
        assert body["total_points"] == 35

    def test_submission_creates_new_contributor_if_not_exists(self):
        """存在しないcontributor_idの場合、新規作成される"""
        mock_db = _make_mock_db(contributor=None)
        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.post(
            "/api/submissions",
            data={
                "latitude": "35.0",
                "longitude": "135.0",
                "density": "low",
                "contributor_id": "new_user",
            },
        )

        assert response.status_code == 201
        body = response.json()
        assert body["points_earned"] == 10

    def test_submission_missing_latitude_returns_422(self):
        """緯度が欠けている場合、422を返す"""
        client = TestClient(app)
        response = client.post(
            "/api/submissions",
            data={
                "longitude": "139.6503",
                "density": "medium",
                "contributor_id": "user1",
            },
        )
        assert response.status_code == 422

    def test_submission_missing_density_returns_422(self):
        """密度レベルが欠けている場合、422を返す"""
        client = TestClient(app)
        response = client.post(
            "/api/submissions",
            data={
                "latitude": "35.6762",
                "longitude": "139.6503",
                "contributor_id": "user1",
            },
        )
        assert response.status_code == 422

    def test_submission_invalid_density_returns_422(self):
        """不正な密度レベル値の場合、422とカスタムエラーメッセージを返す"""
        client = TestClient(app)
        response = client.post(
            "/api/submissions",
            data={
                "latitude": "35.6762",
                "longitude": "139.6503",
                "density": "extreme",
                "contributor_id": "user1",
            },
        )
        assert response.status_code == 422
        body = response.json()
        density_errors = [
            e for e in body["detail"] if "density" in e.get("loc", [])
        ]
        assert len(density_errors) == 1
        assert density_errors[0]["msg"] == "密度レベルはlow, medium, highのいずれかを指定してください。"

    def test_submission_missing_contributor_id_returns_422(self):
        """contributor_idが欠けている場合、422を返す"""
        client = TestClient(app)
        response = client.post(
            "/api/submissions",
            data={
                "latitude": "35.6762",
                "longitude": "139.6503",
                "density": "low",
            },
        )
        assert response.status_code == 422

    def test_submission_missing_longitude_returns_422(self):
        """経度が欠けている場合、422を返す"""
        client = TestClient(app)
        response = client.post(
            "/api/submissions",
            data={
                "latitude": "35.6762",
                "density": "medium",
                "contributor_id": "user1",
            },
        )
        assert response.status_code == 422
