"""
REST API routes for the Climate Legislative Radar.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from backend.classifiers.ensemble import EnsembleResult, classify_ensemble
from backend.database import get_session
from backend.models import Bill

router = APIRouter(prefix="/api")


# --- Pydantic schemas ---


class BillOut(BaseModel):
    id: str
    external_id: str
    source: str
    bill_type: str
    number: int
    year: int
    ementa: str
    full_text: Optional[str] = None
    author: Optional[str] = None
    author_party: Optional[str] = None
    author_state: Optional[str] = None
    presentation_date: Optional[str] = None
    status: Optional[str] = None
    link: str
    theme_ids: Optional[str] = None
    theme_names: Optional[str] = None
    keyword_score: Optional[float] = None
    bert_score: Optional[float] = None
    final_score: Optional[float] = None
    classification: Optional[str] = None
    classified_at: Optional[str] = None
    created_at: Optional[str] = None

    model_config = {"from_attributes": True}


class BillsResponse(BaseModel):
    items: list[BillOut]
    total: int
    page: int
    limit: int


class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Bill ementa to classify")


class ClassifyResponse(BaseModel):
    final_score: float
    classification: str
    confidence: str
    components: dict[str, float]
    evidence: list[str]


class StatsResponse(BaseModel):
    total_bills: int
    by_classification: dict[str, int]
    by_source: dict[str, int]
    by_year: dict[str, int]


# --- Endpoints ---


@router.get("/bills", response_model=BillsResponse)
def list_bills(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    classification: Optional[str] = None,
    source: Optional[str] = None,
    year: Optional[int] = None,
    search: Optional[str] = None,
    theme: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """List classified bills with filters and pagination."""
    query = select(Bill)

    if classification:
        query = query.where(Bill.classification == classification)
    if source:
        query = query.where(Bill.source == source)
    if year:
        query = query.where(Bill.year == year)
    if search:
        query = query.where(Bill.ementa.ilike(f"%{search}%"))
    if theme:
        query = query.where(Bill.theme_ids.ilike(f"%{theme}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total = session.execute(count_query).scalar() or 0

    query = query.order_by(desc(Bill.created_at))
    query = query.offset((page - 1) * limit).limit(limit)

    bills = session.execute(query).scalars().all()

    return BillsResponse(
        items=[BillOut.model_validate(b) for b in bills],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/bills/{bill_id}", response_model=BillOut)
def get_bill(bill_id: str, session: Session = Depends(get_session)):
    """Get full bill details."""
    bill = session.get(Bill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return BillOut.model_validate(bill)


@router.get("/stats", response_model=StatsResponse)
def get_stats(session: Session = Depends(get_session)):
    """Dashboard statistics."""
    total = session.execute(select(func.count(Bill.id))).scalar() or 0

    by_class: dict[str, int] = {}
    rows = session.execute(
        select(Bill.classification, func.count(Bill.id)).group_by(
            Bill.classification
        )
    ).all()
    for label, count in rows:
        if label:
            by_class[label] = count

    by_source: dict[str, int] = {}
    rows = session.execute(
        select(Bill.source, func.count(Bill.id)).group_by(Bill.source)
    ).all()
    for src, count in rows:
        by_source[src] = count

    by_year: dict[str, int] = {}
    rows = session.execute(
        select(Bill.year, func.count(Bill.id)).group_by(Bill.year).order_by(Bill.year)
    ).all()
    for yr, count in rows:
        by_year[str(yr)] = count

    return StatsResponse(
        total_bills=total,
        by_classification=by_class,
        by_source=by_source,
        by_year=by_year,
    )


@router.post("/classify", response_model=ClassifyResponse)
def classify_bill(request: ClassifyRequest):
    """Classify a bill ementa on-demand. Useful for testing and manual entry."""
    result: EnsembleResult = classify_ensemble(request.text)
    return ClassifyResponse(
        final_score=result.final_score,
        classification=result.classification,
        confidence=result.confidence,
        components=result.components,
        evidence=result.evidence,
    )
