"""
SQLAlchemy ORM models for bills and snapshots.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Float, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class Bill(Base):
    __tablename__ = "bills"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    external_id: Mapped[str] = mapped_column(String(50), nullable=False)
    source: Mapped[str] = mapped_column(String(20), nullable=False)
    bill_type: Mapped[str] = mapped_column(String(10), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    ementa: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    author_party: Mapped[str | None] = mapped_column(String(50), nullable=True)
    author_state: Mapped[str | None] = mapped_column(String(2), nullable=True)
    presentation_date: Mapped[datetime | None] = mapped_column(nullable=True)
    status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    link: Mapped[str] = mapped_column(String(500), nullable=False)
    theme_ids: Mapped[str | None] = mapped_column(String(200), nullable=True)
    theme_names: Mapped[str | None] = mapped_column(String(500), nullable=True)

    keyword_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    bert_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    final_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    classification: Mapped[str | None] = mapped_column(String(20), nullable=True)
    classified_at: Mapped[datetime | None] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("source", "external_id", name="uq_source_external_id"),
        Index("ix_bills_classification", "classification"),
        Index("ix_bills_year", "year"),
        Index("ix_bills_source", "source"),
        Index("ix_bills_final_score", "final_score"),
    )


class BillSnapshot(Base):
    __tablename__ = "bill_snapshots"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    bill_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
    )
    status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    snapshot_date: Mapped[datetime] = mapped_column(
        server_default=func.current_date(),
        default=lambda: datetime.now(timezone.utc).date(),
    )

    __table_args__ = (
        Index("ix_snapshots_bill_id", "bill_id"),
    )
