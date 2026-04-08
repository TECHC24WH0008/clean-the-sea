"""SQLAlchemy + GeoAlchemy2 モデル定義

全テーブル（contributors, submissions, point_history, recovery_projects）を
backend/migrations/001_initial_schema.sql と一致するように定義する。
"""

from datetime import date, datetime

from geoalchemy2 import Geometry
from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Double,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Contributor(Base):
    __tablename__ = "contributors"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    total_points: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    submissions: Mapped[list["Submission"]] = relationship(
        back_populates="contributor"
    )
    point_history: Mapped[list["PointHistory"]] = relationship(
        back_populates="contributor"
    )


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        CheckConstraint(
            "density IN ('low', 'medium', 'high')",
            name="submissions_density_check",
        ),
        Index("idx_submissions_location", "location", postgresql_using="gist"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    contributor_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("contributors.id"), nullable=False
    )
    latitude: Mapped[float] = mapped_column(Double, nullable=False)
    longitude: Mapped[float] = mapped_column(Double, nullable=False)
    density: Mapped[str] = mapped_column(String(10), nullable=False)
    photo_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    location = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    contributor: Mapped["Contributor"] = relationship(back_populates="submissions")
    point_history: Mapped["PointHistory"] = relationship(back_populates="submission")


class PointHistory(Base):
    __tablename__ = "point_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    contributor_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("contributors.id"), nullable=False
    )
    submission_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("submissions.id"), nullable=False
    )
    points_earned: Mapped[int] = mapped_column(Integer, nullable=False)
    earned_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    contributor: Mapped["Contributor"] = relationship(back_populates="point_history")
    submission: Mapped["Submission"] = relationship(back_populates="point_history")


class RecoveryProject(Base):
    __tablename__ = "recovery_projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    location_name: Mapped[str] = mapped_column(String(200), nullable=False)
    recovered_tons: Mapped[float] = mapped_column(Double, nullable=False)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    conducted_at: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
