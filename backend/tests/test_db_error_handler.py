"""DB接続エラーハンドリングのテスト (要件 2.3)"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_db_connection_error_returns_503(client):
    """DB接続失敗時にHTTP 503と日本語エラーメッセージを返却する"""
    with patch(
        "app.routers.hotspots.get_hotspots",
        side_effect=OperationalError("connection failed", {}, None),
    ):
        response = client.get("/api/hotspots")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "データベースに接続できません。しばらくしてから再試行してください。"
    }


def test_db_connection_error_with_bbox_params_returns_503(client):
    """バウンディングボックスパラメータ付きリクエストでもDB接続失敗時に503を返却する"""
    with patch(
        "app.routers.hotspots.get_hotspots",
        side_effect=OperationalError("connection refused", {}, None),
    ):
        response = client.get(
            "/api/hotspots",
            params={"min_lat": 30, "max_lat": 40, "min_lng": 130, "max_lng": 140},
        )

    assert response.status_code == 503
    assert response.json()["detail"] == "データベースに接続できません。しばらくしてから再試行してください。"
