"""ポイント取得エンドポイントのテスト (要件 8.4)"""

from datetime import datetime
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import Contributor, PointHistory, Submission


def _override_get_db(mock_db):
    from app.database import get_db

    def override():
        yield mock_db

    app.dependency_overrides[get_db] = override


def _cleanup_overrides():
    app.dependency_overrides.clear()


class TestGetContributorPoints:
    """GET /api/contributors/{contributor_id}/points のテスト"""

    def setup_method(self):
        _cleanup_overrides()

    def teardown_method(self):
        _cleanup_overrides()

    def test_returns_points_and_history(self):
        """累計ポイントと投稿履歴を正しく返却する"""
        contributor = Contributor(id="user1", name="user1", total_points=25)

        sub1 = Submission(
            id=1,
            contributor_id="user1",
            latitude=35.6762,
            longitude=139.6503,
            density="medium",
            photo_path="uploads/photo1.jpg",
            submitted_at=datetime(2024, 1, 15, 10, 30, 0),
        )
        sub2 = Submission(
            id=2,
            contributor_id="user1",
            latitude=34.0522,
            longitude=-118.2437,
            density="high",
            photo_path=None,
            submitted_at=datetime(2024, 1, 10, 8, 0, 0),
        )

        ph1 = PointHistory(
            id=1,
            contributor_id="user1",
            submission_id=1,
            points_earned=15,
        )
        ph2 = PointHistory(
            id=2,
            contributor_id="user1",
            submission_id=2,
            points_earned=10,
        )

        mock_db = MagicMock()
        mock_db.get.return_value = contributor

        # Mock the chained query
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = [(ph1, sub1), (ph2, sub2)]

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/contributors/user1/points")

        assert response.status_code == 200
        body = response.json()
        assert body["contributor_id"] == "user1"
        assert body["total_points"] == 25
        assert len(body["history"]) == 2

        # First entry (most recent)
        h0 = body["history"][0]
        assert h0["id"] == 1
        assert h0["latitude"] == 35.6762
        assert h0["longitude"] == 139.6503
        assert h0["points_earned"] == 15
        assert h0["has_photo"] is True

        # Second entry
        h1 = body["history"][1]
        assert h1["id"] == 2
        assert h1["latitude"] == 34.0522
        assert h1["longitude"] == -118.2437
        assert h1["points_earned"] == 10
        assert h1["has_photo"] is False

    def test_returns_404_for_unknown_contributor(self):
        """存在しないcontributor_idの場合、404を返す"""
        mock_db = MagicMock()
        mock_db.get.return_value = None

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/contributors/unknown_user/points")

        assert response.status_code == 404
        assert response.json()["detail"] == "投稿者が見つかりません。"

    def test_returns_empty_history_for_contributor_with_no_submissions(self):
        """投稿履歴がない投稿者の場合、空のhistoryを返す"""
        contributor = Contributor(id="new_user", name="new_user", total_points=0)

        mock_db = MagicMock()
        mock_db.get.return_value = contributor

        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = []

        _override_get_db(mock_db)

        client = TestClient(app)
        response = client.get("/api/contributors/new_user/points")

        assert response.status_code == 200
        body = response.json()
        assert body["contributor_id"] == "new_user"
        assert body["total_points"] == 0
        assert body["history"] == []
