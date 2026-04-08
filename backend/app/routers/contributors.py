"""ポイント取得APIルーター"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Contributor, PointHistory, Submission
from ..schemas import ContributorPointsResponse, PointHistoryItem

router = APIRouter(prefix="/api", tags=["contributors"])


@router.get(
    "/contributors/{contributor_id}/points",
    response_model=ContributorPointsResponse,
)
def get_contributor_points(
    contributor_id: str,
    db: Session = Depends(get_db),
) -> ContributorPointsResponse:
    contributor = db.get(Contributor, contributor_id)
    if contributor is None:
        raise HTTPException(status_code=404, detail="投稿者が見つかりません。")

    rows = (
        db.query(PointHistory, Submission)
        .join(Submission, PointHistory.submission_id == Submission.id)
        .filter(PointHistory.contributor_id == contributor_id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )

    history = [
        PointHistoryItem(
            id=ph.id,
            submitted_at=sub.submitted_at,
            latitude=sub.latitude,
            longitude=sub.longitude,
            points_earned=ph.points_earned,
            has_photo=sub.photo_path is not None,
        )
        for ph, sub in rows
    ]

    return ContributorPointsResponse(
        contributor_id=contributor.id,
        total_points=contributor.total_points,
        history=history,
    )
