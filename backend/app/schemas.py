"""Pydantic レスポンススキーマ定義"""

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel


class DensityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class HotspotResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    density: DensityLevel
    reported_at: datetime

    model_config = {"from_attributes": True}


class HotspotListResponse(BaseModel):
    hotspots: list[HotspotResponse]


class SubmissionResponse(BaseModel):
    id: int
    points_earned: int
    total_points: int


class PointHistoryItem(BaseModel):
    id: int
    submitted_at: datetime
    latitude: float
    longitude: float
    points_earned: int
    has_photo: bool


class ContributorPointsResponse(BaseModel):
    contributor_id: str
    total_points: int
    history: list[PointHistoryItem]


class ProjectSummaryResponse(BaseModel):
    id: int
    location_name: str
    recovered_tons: float
    photo_url: str
    conducted_at: date

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: list[ProjectSummaryResponse]


class ProjectDetailResponse(BaseModel):
    id: int
    location_name: str
    recovered_tons: float
    photo_url: str
    conducted_at: date
    description: str | None

    model_config = {"from_attributes": True}
