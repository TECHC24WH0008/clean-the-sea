"""ホットスポット取得APIルーター"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from geoalchemy2.functions import ST_MakeEnvelope, ST_Within
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Submission
from ..schemas import HotspotListResponse, HotspotResponse

router = APIRouter(prefix="/api", tags=["hotspots"])


@router.get("/hotspots", response_model=HotspotListResponse)
def get_hotspots(
    min_lat: Optional[float] = Query(None, description="バウンディングボックス南端"),
    max_lat: Optional[float] = Query(None, description="バウンディングボックス北端"),
    min_lng: Optional[float] = Query(None, description="バウンディングボックス西端"),
    max_lng: Optional[float] = Query(None, description="バウンディングボックス東端"),
    db: Session = Depends(get_db),
) -> HotspotListResponse:
    query = db.query(Submission)

    bbox_params = [min_lat, max_lat, min_lng, max_lng]
    if all(p is not None for p in bbox_params):
        envelope = ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
        query = query.filter(ST_Within(Submission.location, envelope))

    submissions = query.all()

    hotspots = [
        HotspotResponse(
            id=s.id,
            latitude=s.latitude,
            longitude=s.longitude,
            density=s.density,
            reported_at=s.submitted_at,
        )
        for s in submissions
    ]

    return HotspotListResponse(hotspots=hotspots)
