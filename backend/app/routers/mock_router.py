"""モックAPIルーター — PostgreSQLなしで全エンドポイントを提供"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from ..mock_data import (
    MOCK_HOTSPOTS,
    MOCK_PROJECTS,
    _mock_contributors,
    _mock_point_history,
    _mock_submissions,
)
from ..schemas import (
    ContributorPointsResponse,
    DensityLevel,
    HotspotListResponse,
    HotspotResponse,
    PointHistoryItem,
    ProjectDetailResponse,
    ProjectListResponse,
    ProjectSummaryResponse,
    SubmissionResponse,
)

router = APIRouter(prefix="/api", tags=["mock"])


# --- ホットスポット ---
@router.get("/hotspots", response_model=HotspotListResponse)
def get_hotspots_mock(
    min_lat: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    min_lng: Optional[float] = Query(None),
    max_lng: Optional[float] = Query(None),
) -> HotspotListResponse:
    # 投稿されたデータもホットスポットに含める
    all_hotspots = list(MOCK_HOTSPOTS)
    for sub in _mock_submissions:
        all_hotspots.append({
            "id": 100 + sub["id"],
            "latitude": sub["latitude"],
            "longitude": sub["longitude"],
            "density": sub["density"],
            "reported_at": sub["submitted_at"],
        })

    filtered = all_hotspots
    if all(p is not None for p in [min_lat, max_lat, min_lng, max_lng]):
        filtered = [
            h for h in all_hotspots
            if min_lat <= h["latitude"] <= max_lat and min_lng <= h["longitude"] <= max_lng
        ]

    return HotspotListResponse(
        hotspots=[HotspotResponse(**h) for h in filtered]
    )


# --- データ投稿 ---
@router.post("/submissions", response_model=SubmissionResponse, status_code=201)
def create_submission_mock(
    latitude: float = Form(...),
    longitude: float = Form(...),
    density: DensityLevel = Form(...),
    contributor_id: str = Form(...),
    photo: UploadFile | None = File(None),
) -> SubmissionResponse:
    import backend.app.mock_data as md

    has_photo = photo is not None and photo.filename is not None and photo.filename != ""
    base_points = 10
    photo_bonus = 5 if has_photo else 0
    points_earned = base_points + photo_bonus

    # 投稿者の作成/更新
    if contributor_id not in _mock_contributors:
        _mock_contributors[contributor_id] = {
            "id": contributor_id,
            "name": contributor_id,
            "total_points": 0,
        }
    _mock_contributors[contributor_id]["total_points"] += points_earned

    submission_id = md._next_submission_id
    md._next_submission_id += 1

    submission = {
        "id": submission_id,
        "contributor_id": contributor_id,
        "latitude": latitude,
        "longitude": longitude,
        "density": density.value,
        "photo_path": f"uploads/mock_{submission_id}.jpg" if has_photo else None,
        "submitted_at": datetime.now().isoformat(),
    }
    _mock_submissions.append(submission)

    point_id = md._next_point_id
    md._next_point_id += 1

    _mock_point_history.append({
        "id": point_id,
        "contributor_id": contributor_id,
        "submission_id": submission_id,
        "points_earned": points_earned,
        "submitted_at": submission["submitted_at"],
        "latitude": latitude,
        "longitude": longitude,
        "has_photo": has_photo,
    })

    return SubmissionResponse(
        id=submission_id,
        points_earned=points_earned,
        total_points=_mock_contributors[contributor_id]["total_points"],
    )


# --- ポイント ---
@router.get("/contributors/{contributor_id}/points", response_model=ContributorPointsResponse)
def get_contributor_points_mock(contributor_id: str) -> ContributorPointsResponse:
    contributor = _mock_contributors.get(contributor_id)
    if contributor is None:
        raise HTTPException(status_code=404, detail="投稿者が見つかりません。")

    history = [
        PointHistoryItem(
            id=ph["id"],
            submitted_at=ph["submitted_at"],
            latitude=ph["latitude"],
            longitude=ph["longitude"],
            points_earned=ph["points_earned"],
            has_photo=ph["has_photo"],
        )
        for ph in reversed(_mock_point_history)
        if ph["contributor_id"] == contributor_id
    ]

    return ContributorPointsResponse(
        contributor_id=contributor_id,
        total_points=contributor["total_points"],
        history=history,
    )


# --- 回収プロジェクト ---
@router.get("/projects", response_model=ProjectListResponse)
def get_projects_mock() -> ProjectListResponse:
    return ProjectListResponse(
        projects=[
            ProjectSummaryResponse(
                id=p["id"],
                location_name=p["location_name"],
                recovered_tons=p["recovered_tons"],
                photo_url=p["photo_url"],
                conducted_at=p["conducted_at"],
            )
            for p in MOCK_PROJECTS
        ]
    )


@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project_mock(project_id: int) -> ProjectDetailResponse:
    project = next((p for p in MOCK_PROJECTS if p["id"] == project_id), None)
    if project is None:
        raise HTTPException(status_code=404, detail="指定されたプロジェクトが見つかりません。")
    return ProjectDetailResponse(**project)
