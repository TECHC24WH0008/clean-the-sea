"""モックデータ — PostgreSQLなしでアプリの動作確認用"""

from datetime import datetime, date

MOCK_HOTSPOTS = [
    {"id": 1, "latitude": 35.45, "longitude": 139.65, "density": "high", "reported_at": "2025-06-01T10:00:00"},
    {"id": 2, "latitude": 34.70, "longitude": 135.20, "density": "medium", "reported_at": "2025-05-28T14:30:00"},
    {"id": 3, "latitude": 33.59, "longitude": 130.40, "density": "low", "reported_at": "2025-05-20T09:15:00"},
    {"id": 4, "latitude": 26.33, "longitude": 127.80, "density": "high", "reported_at": "2025-06-03T11:00:00"},
    {"id": 5, "latitude": 43.06, "longitude": 141.35, "density": "medium", "reported_at": "2025-05-15T08:45:00"},
    {"id": 6, "latitude": 24.45, "longitude": 122.95, "density": "high", "reported_at": "2025-06-05T16:20:00"},
    {"id": 7, "latitude": 31.60, "longitude": 131.45, "density": "low", "reported_at": "2025-04-10T07:30:00"},
    {"id": 8, "latitude": 36.95, "longitude": 140.85, "density": "medium", "reported_at": "2025-05-22T13:00:00"},
    {"id": 9, "latitude": 34.25, "longitude": 132.55, "density": "high", "reported_at": "2025-06-02T15:45:00"},
    {"id": 10, "latitude": 38.90, "longitude": 139.85, "density": "low", "reported_at": "2025-04-25T10:30:00"},
]

MOCK_PROJECTS = [
    {
        "id": 1,
        "location_name": "東京湾",
        "recovered_tons": 12.5,
        "photo_url": "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800",
        "conducted_at": "2025-03-15",
        "description": "東京湾沿岸の大規模清掃プロジェクト。漁業組合と地元ボランティア200名が参加し、マイクロプラスチックを含む12.5トンのプラスチック廃棄物を回収しました。",
    },
    {
        "id": 2,
        "location_name": "大阪湾",
        "recovered_tons": 8.3,
        "photo_url": "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800",
        "conducted_at": "2025-04-20",
        "description": "大阪湾の河口域を中心とした清掃活動。ペットボトルや漁網など8.3トンを回収。地元企業5社がスポンサーとして参加。",
    },
    {
        "id": 3,
        "location_name": "沖縄・慶良間諸島",
        "recovered_tons": 5.7,
        "photo_url": "https://images.unsplash.com/photo-1484291150605-0860ed671425?w=800",
        "conducted_at": "2025-05-10",
        "description": "慶良間諸島周辺のサンゴ礁保護を兼ねた清掃プロジェクト。ダイバーチームが海底のプラスチック廃棄物5.7トンを回収。",
    },
]

# モック投稿者データ（投稿時に動的に更新）
_mock_contributors: dict = {}
_mock_submissions: list = []
_mock_point_history: list = []
_next_submission_id = 1
_next_point_id = 1
