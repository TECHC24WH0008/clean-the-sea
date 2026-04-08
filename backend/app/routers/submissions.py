"""データ投稿APIルーター"""

import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from geoalchemy2 import WKTElement
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Contributor, PointHistory, Submission
from ..schemas import DensityLevel, SubmissionResponse

router = APIRouter(prefix="/api", tags=["submissions"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")


def calculate_points(has_photo: bool) -> int:
    """ポイント計算: 基本10pt、写真付き+5pt"""
    base_points = 10
    photo_bonus = 5 if has_photo else 0
    return base_points + photo_bonus


@router.post("/submissions", response_model=SubmissionResponse, status_code=201)
def create_submission(
    latitude: float = Form(...),
    longitude: float = Form(...),
    density: DensityLevel = Form(...),
    contributor_id: str = Form(...),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> SubmissionResponse:
    # 写真アップロード処理
    photo_path: str | None = None
    if photo and photo.filename:
        try:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            ext = os.path.splitext(photo.filename)[1]
            filename = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            with open(file_path, "wb") as f:
                f.write(photo.file.read())
            photo_path = f"uploads/{filename}"
        except Exception:
            raise HTTPException(status_code=500, detail="写真のアップロードに失敗しました。")

    has_photo = photo_path is not None
    points_earned = calculate_points(has_photo)

    # PostGIS POINT型に変換
    location = WKTElement(f"POINT({longitude} {latitude})", srid=4326)

    # 1トランザクションで投稿・ポイント更新・履歴記録を実行
    # contributor が存在しなければ作成
    contributor = db.get(Contributor, contributor_id)
    if contributor is None:
        contributor = Contributor(
            id=contributor_id,
            name=contributor_id,
            total_points=0,
        )
        db.add(contributor)
        db.flush()

    submission = Submission(
        contributor_id=contributor_id,
        latitude=latitude,
        longitude=longitude,
        density=density.value,
        photo_path=photo_path,
        location=location,
    )
    db.add(submission)
    db.flush()

    point_record = PointHistory(
        contributor_id=contributor_id,
        submission_id=submission.id,
        points_earned=points_earned,
    )
    db.add(point_record)

    contributor.total_points += points_earned

    db.commit()
    db.refresh(contributor)

    return SubmissionResponse(
        id=submission.id,
        points_earned=points_earned,
        total_points=contributor.total_points,
    )
