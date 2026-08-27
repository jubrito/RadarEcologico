"""
REST API routes for the Climate Legislative Radar.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_serializer, model_validator
from sqlalchemy import String, desc, func, or_, select
from sqlalchemy.orm import Session

from backend.classifiers.ensemble import EnsembleResult, classify_ensemble
from backend.database import get_session
from backend.models import Bill
from backend.scrapers.camara import THEME_NAMES, fetch_camara_tramitacoes, fetch_camara_votacoes
from backend.scrapers.senado import fetch_senado_tramitacoes
from backend.types import ClassificationLabelWithUnknown, ComponentsDict

router = APIRouter(prefix="/api")

_VALID_CLASSIFICATIONS = frozenset({"favorable", "needs_review", "unfavorable"})


class BillOut(BaseModel):
    id: str
    external_id: str
    source: str
    bill_type: str
    number: int
    year: int
    ementa: str
    author: Optional[str] = None
    author_party: Optional[str] = None
    author_state: Optional[str] = None
    presentation_date: Optional[datetime] = None
    status: Optional[str] = None
    link: str
    theme_ids: Optional[str] = None
    theme_names: Optional[str] = None
    keyword_score: Optional[float] = None
    bert_score: Optional[float] = None
    final_score: Optional[float] = None
    classification: Optional[str] = None
    classified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @field_serializer("presentation_date", "classified_at", "created_at")
    def serialize_dt(self, value: datetime | None) -> str | None:
        if value is None:
            return None
        return value.isoformat()

    @model_validator(mode="after")
    def normalize_classification(self) -> "BillOut":
        """Ensure classification is always a known value."""
        if self.classification not in _VALID_CLASSIFICATIONS:
            self.classification = "unknown"
        return self


class BillsResponse(BaseModel):
    items: list[BillOut]
    total: int
    page: int
    limit: int


class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Bill ementa to classify")


class ClassifyResponse(BaseModel):
    final_score: float
    classification: ClassificationLabelWithUnknown
    confidence: str
    components: ComponentsDict
    evidence: list[str]


class StatsResponse(BaseModel):
    total_bills: int
    by_classification: dict[str, int]
    by_source: dict[str, int]
    by_year: dict[str, int]
    by_theme: dict[str, int]
    by_party: dict[str, int]


class TramitacaoEventOut(BaseModel):
    date: str
    description: str
    orgao: Optional[str] = None


class OrientacaoVotoOut(BaseModel):
    partido: str
    voto: str


class VotacaoEventOut(BaseModel):
    date: str
    orgao: Optional[str] = None
    description: str
    aprovado: bool
    orientacoes: list[OrientacaoVotoOut]


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
    party: Optional[str] = None,
    session: Session = Depends(get_session),
) -> BillsResponse:
    """List classified bills with filters and pagination."""
    query = select(Bill)

    if classification:
        query = query.where(Bill.classification == classification)
    if source:
        query = query.where(Bill.source == source)
    if year:
        query = query.where(Bill.year == year)
    if party:
        query = query.where(Bill.author_party == party)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Bill.ementa.ilike(search_term),
                Bill.bill_type.ilike(search_term),
                Bill.author.ilike(search_term),
                Bill.status.ilike(search_term),
                func.cast(Bill.number, String).ilike(search_term),
            )
        )
    if theme:
        theme_codes = [t.strip() for t in theme.split(",") if t.strip()]
        if theme_codes:
            conditions = [Bill.theme_ids.ilike(f"%{t}%") for t in theme_codes]
            query = query.where(or_(*conditions))

    count_query = select(func.count()).select_from(query.subquery())
    total = session.execute(count_query).scalar() or 0

    query = query.order_by(desc(Bill.presentation_date).nullslast())
    query = query.offset((page - 1) * limit).limit(limit)

    bills = session.execute(query).scalars().all()

    return BillsResponse(
        items=[BillOut.model_validate(b) for b in bills],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/bills/{bill_id}", response_model=BillOut)
def get_bill(bill_id: str, session: Session = Depends(get_session)) -> BillOut:
    """Get full bill details."""
    bill = session.get(Bill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return BillOut.model_validate(bill)


@router.get("/bills/{bill_id}/tramitacoes", response_model=list[TramitacaoEventOut])
def get_bill_tramitacoes(
    bill_id: str, session: Session = Depends(get_session)
) -> list[TramitacaoEventOut]:
    """Get the tramitação (milestone) events for a bill, from the source API."""
    bill = session.get(Bill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if bill.source == "camara":
        events = fetch_camara_tramitacoes(bill.external_id)
    elif bill.source == "senado":
        events = fetch_senado_tramitacoes(bill.external_id)
    else:
        events = []
    return [TramitacaoEventOut(**event) for event in events]


@router.get("/bills/{bill_id}/votacoes", response_model=list[VotacaoEventOut])
def get_bill_votacoes(
    bill_id: str, session: Session = Depends(get_session)
) -> list[VotacaoEventOut]:
    """Get the votations for a bill (with per-party orientations), from the source API."""
    bill = session.get(Bill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if bill.source == "camara":
        votacoes = fetch_camara_votacoes(bill.external_id)
    else:
        votacoes = []
    return [VotacaoEventOut(**votacao) for votacao in votacoes]


@router.get("/stats", response_model=StatsResponse)
def get_stats(session: Session = Depends(get_session)) -> StatsResponse:
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

    by_theme: dict[str, int] = {}
    for theme_id in THEME_NAMES:
        count = session.execute(
            select(func.count(Bill.id)).where(
                Bill.theme_ids.ilike(f"%{theme_id}%")
            )
        ).scalar() or 0
        by_theme[theme_id] = count

    by_party: dict[str, int] = {}
    rows = session.execute(
        select(Bill.author_party, func.count(Bill.id)).group_by(Bill.author_party)
    ).all()
    for party, count in rows:
        if party:
            by_party[party] = count

    return StatsResponse(
        total_bills=total,
        by_classification=by_class,
        by_source=by_source,
        by_year=by_year,
        by_theme=by_theme,
        by_party=by_party,
    )


@router.post("/classify", response_model=ClassifyResponse)
def classify_bill(request: ClassifyRequest) -> ClassifyResponse:
    """Classify a bill ementa on-demand. Useful for testing and manual entry."""
    result: EnsembleResult = classify_ensemble(request.text)
    return ClassifyResponse(
        final_score=result.final_score,
        classification=result.classification,
        confidence=result.confidence,
        components=result.components,
        evidence=result.evidence,
    )
