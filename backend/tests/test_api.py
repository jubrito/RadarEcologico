"""
Tests for REST API routes using FastAPI TestClient with dependency overrides.
"""

import uuid
from datetime import datetime, timezone
from typing import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.api.routes import get_session
from backend.main import app


def _bill_row(**overrides) -> MagicMock:
    defaults = {
        "id": str(uuid.uuid4()),
        "external_id": "12345",
        "source": "camara",
        "bill_type": "PL",
        "number": 123,
        "year": 2026,
        "ementa": "Institui política de combate ao desmatamento.",
        "author": "Dep. João Silva",
        "author_party": "PT",
        "author_state": "SP",
        "presentation_date": datetime(2026, 1, 15),
        "status": "Tramitando",
        "link": "https://www.camara.leg.br/proposicoes/12345",
        "theme_ids": "48,54",
        "theme_names": "Meio Ambiente,Energia",
        "keyword_score": 0.12,
        "bert_score": None,
        "final_score": 0.12,
        "classification": "favorable",
        "classified_at": datetime(2026, 8, 1, tzinfo=timezone.utc),
        "created_at": datetime(2026, 8, 1, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 8, 1, tzinfo=timezone.utc),
    }
    defaults.update(overrides)
    return MagicMock(**defaults)


def _make_session(*, bills: list[MagicMock] | None = None, total: int | None = None) -> MagicMock:
    bills = bills or []
    total = total if total is not None else len(bills)
    session = MagicMock(spec=Session)

    # get_bill: session.get(Bill, bill_id)
    session.get.return_value = bills[0] if bills else None

    # list_bills: count + scalars
    count_result = MagicMock()
    count_result.scalar.return_value = total

    scalar_result = MagicMock()
    scalar_result.scalars.return_value.all.return_value = bills
    scalar_result.scalar.return_value = total

    session.execute.return_value = scalar_result

    return session


@pytest.fixture(autouse=True)
def override_db():
    app.dependency_overrides[get_session] = lambda: MagicMock(spec=Session)
    yield
    app.dependency_overrides.pop(get_session, None)


class TestListBills:
    def test_returns_paginated_bills(self):
        bills = [_bill_row() for _ in range(3)]
        session = _make_session(bills=bills, total=3)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?page=1&limit=2")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert data["page"] == 1
        assert data["limit"] == 2
        assert len(data["items"]) == 3

    def test_filters_by_classification(self):
        bills = [_bill_row(classification="unfavorable")]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?classification=unfavorable")
        assert response.status_code == 200
        assert response.json()["total"] == 1

    def test_filters_by_source(self):
        bills = [_bill_row(source="senado")]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?source=senado")
        assert response.status_code == 200
        assert response.json()["total"] == 1

    def test_filters_by_party(self):
        bills = [_bill_row(author_party="PT")]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?party=PT")
        assert response.status_code == 200
        assert response.json()["total"] == 1

    def test_filters_by_theme(self):
        bills = [_bill_row(theme_ids="48,64")]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?theme=48")
        assert response.status_code == 200

    def test_filters_by_year(self):
        bills = [_bill_row(year=2025)]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?year=2025")
        assert response.status_code == 200

    def test_filters_by_search(self):
        bills = [_bill_row(ementa="desmatamento na Amazônia")]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?search=desmatamento")
        assert response.status_code == 200

    def test_enforces_pagination_limits(self):
        client = TestClient(app)
        response = client.get("/api/bills?limit=200")
        assert response.status_code == 422

    def test_page_validation(self):
        client = TestClient(app)
        response = client.get("/api/bills?page=0")
        assert response.status_code == 422


class TestGetBill:
    def test_returns_bill_by_id(self):
        bill = _bill_row(id="abc-123")
        session = _make_session(bills=[bill], total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills/abc-123")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "abc-123"
        assert data["classification"] == "favorable"
        assert data["theme_ids"] == "48,54"
        assert data["presentation_date"] is not None

    def test_returns_404_for_missing_bill(self):
        session = _make_session(bills=[], total=0)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills/nonexistent")
        assert response.status_code == 404

    def test_normalizes_unknown_classification(self):
        bill = _bill_row(id="xyz-999", classification="invalid_label")
        session = _make_session(bills=[bill], total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills/xyz-999")
        assert response.status_code == 200
        assert response.json()["classification"] == "unknown"


class TestTramitacoes:
    def test_returns_tramitacoes_for_camara_bill(self):
        bill = _bill_row(id="abc-123", source="camara", external_id="12345")
        session = _make_session(bills=[bill], total=1)
        events = [
            {"date": "2026-02-02", "description": "Apresentação de Proposição", "orgao": "MESA"},
        ]

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        with patch("backend.api.routes.fetch_camara_tramitacoes", return_value=events):
            response = client.get("/api/bills/abc-123/tramitacoes")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["description"] == "Apresentação de Proposição"
        assert data[0]["orgao"] == "MESA"

    def test_returns_404_for_missing_bill(self):
        session = _make_session(bills=[], total=0)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills/nonexistent/tramitacoes")
        assert response.status_code == 404


class TestVotacoes:
    def test_returns_votacoes_for_camara_bill(self):
        bill = _bill_row(id="abc-123", source="camara", external_id="12345")
        session = _make_session(bills=[bill], total=1)
        votacoes = [
            {
                "date": "2025-03-27",
                "orgao": "Plenário",
                "description": "Aprovação do Projeto",
                "aprovado": True,
                "orientacoes": [{"partido": "PL", "voto": "Sim"}],
            }
        ]

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        with patch("backend.api.routes.fetch_camara_votacoes", return_value=votacoes):
            response = client.get("/api/bills/abc-123/votacoes")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["aprovado"] is True
        assert data[0]["orientacoes"][0]["partido"] == "PL"

    def test_returns_404_for_missing_bill(self):
        session = _make_session(bills=[], total=0)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills/nonexistent/votacoes")
        assert response.status_code == 404


class TestGetStats:
    def test_returns_stats(self):
        session = MagicMock(spec=Session)

        total_result = MagicMock()
        total_result.scalar.return_value = 10

        classification_rows = [("favorable", 4), ("unfavorable", 3), ("needs_review", 3)]
        source_rows = [("camara", 7), ("senado", 3)]
        year_rows = [(2026, 8), (2025, 2)]
        party_rows = [("PT", 3), ("PL", 2)]

        theme_result = MagicMock()
        theme_result.scalar.return_value = 1

        session.execute.side_effect = [
            total_result,
            MagicMock(all=lambda: classification_rows),
            MagicMock(all=lambda: source_rows),
            MagicMock(all=lambda: year_rows),
        ] + [theme_result] * 15 + [MagicMock(all=lambda: party_rows)]

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_bills"] == 10
        assert data["by_classification"]["favorable"] == 4
        assert data["by_source"]["camara"] == 7
        assert data["by_year"]["2026"] == 8
        assert data["by_theme"]["48"] == 1
        assert data["by_party"]["PT"] == 3

    def test_handles_empty_db(self):
        session = MagicMock(spec=Session)

        empty_total = MagicMock()
        empty_total.scalar.return_value = 0

        empty_theme = MagicMock()
        empty_theme.scalar.return_value = 0

        session.execute.side_effect = [
            empty_total,
            MagicMock(all=lambda: []),
            MagicMock(all=lambda: []),
            MagicMock(all=lambda: []),
        ] + [empty_theme] * 15 + [MagicMock(all=lambda: [])]

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_bills"] == 0
        assert data["by_classification"] == {}

    def test_by_theme_returns_counts(self):
        session = MagicMock(spec=Session)

        total_result = MagicMock()
        total_result.scalar.return_value = 5

        theme_result = MagicMock()
        theme_result.scalar.return_value = 3

        session.execute.side_effect = [
            total_result,
            MagicMock(all=lambda: []),
            MagicMock(all=lambda: []),
            MagicMock(all=lambda: []),
        ] + [theme_result] * 15 + [MagicMock(all=lambda: [])]

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "by_theme" in data
        assert data["by_theme"]["48"] == 3


class TestMultiThemeFilter:
    def test_filters_by_comma_separated_themes(self):
        bills = [_bill_row(theme_ids="48,54"), _bill_row(theme_ids="64")]
        session = _make_session(bills=bills, total=2)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?theme=48,64")
        assert response.status_code == 200
        assert response.json()["total"] == 2

    def test_filters_by_single_theme(self):
        bills = [_bill_row(theme_ids="48")]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?theme=48")
        assert response.status_code == 200
        assert response.json()["total"] == 1

    def test_combines_theme_with_other_filters(self):
        bills = [_bill_row(theme_ids="48,54", classification="favorable")]
        session = _make_session(bills=bills, total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills?theme=48&classification=favorable")
        assert response.status_code == 200


class TestClassify:
    def test_classifies_favorable(self):
        client = TestClient(app)

        response = client.post(
            "/api/classify",
            json={
                "text": "Institui política nacional de mudanças climáticas "
                        "e cria programa de reflorestamento."
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "final_score" in data
        assert data["classification"] in ("favorable", "needs_review", "unfavorable")
        assert "keyword_score" in data["components"]
        assert "evidence" in data

    def test_classifies_unfavorable(self):
        client = TestClient(app)

        response = client.post(
            "/api/classify",
            json={
                "text": "Flexibiliza licenciamento ambiental e anistia "
                        "desmatamento e autoriza mineração em terra indígena."
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["classification"] == "unfavorable"
        assert data["final_score"] >= 0.60

    def test_classifies_neutral(self):
        client = TestClient(app)

        response = client.post(
            "/api/classify",
            json={"text": "Institui o Dia Nacional do Brigadeiro de Panela."},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["classification"] == "needs_review"
        assert 0.35 <= data["final_score"] < 0.65

    def test_rejects_short_text(self):
        client = TestClient(app)
        response = client.post("/api/classify", json={"text": "curto"})
        assert response.status_code == 422

    def test_rejects_empty_text(self):
        client = TestClient(app)
        response = client.post("/api/classify", json={"text": ""})
        assert response.status_code == 422


class TestSearch:
    def test_searches_ementa(self):
        session = _make_session(bills=[], total=0)
        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)
        response = client.get("/api/bills?search=desmatamento")
        assert response.status_code == 200

    def test_searches_bill_type(self):
        session = _make_session(bills=[], total=0)
        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)
        response = client.get("/api/bills?search=PLP")
        assert response.status_code == 200

    def test_searches_author(self):
        session = _make_session(bills=[], total=0)
        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)
        response = client.get("/api/bills?search=João")
        assert response.status_code == 200

    def test_searches_status(self):
        session = _make_session(bills=[], total=0)
        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)
        response = client.get("/api/bills?search=Tramitando")
        assert response.status_code == 200

    def test_searches_number(self):
        session = _make_session(bills=[], total=0)
        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)
        response = client.get("/api/bills?search=456")
        assert response.status_code == 200


class TestHealthCheck:
    def test_health_ok(self):
        client = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        assert response.json()["service"] == "radar-ecologico"


class TestBillResponseShape:
    def test_serialization(self):
        bill = _bill_row(id="serial-1")
        session = _make_session(bills=[bill], total=1)

        app.dependency_overrides[get_session] = lambda: session
        client = TestClient(app)

        response = client.get("/api/bills/serial-1")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["id"], str)
        assert isinstance(data["number"], int)
        assert isinstance(data["year"], int)
        assert isinstance(data["keyword_score"], float)
        assert isinstance(data["final_score"], float)
        assert isinstance(data["presentation_date"], str)
        assert isinstance(data["classified_at"], str)
        assert isinstance(data["created_at"], str)
        assert data["theme_ids"] == "48,54"
        assert data["theme_names"] == "Meio Ambiente,Energia"


def test_list_bills_orders_by_presentation_date_desc():
    """Bills should be returned most-recent-first, ordered by presentation_date."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from backend.api.routes import list_bills
    from backend.models import Base, Bill

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    def make_bill(external_id: str, day: int) -> Bill:
        return Bill(
            external_id=external_id,
            source="camara",
            bill_type="PL",
            number=int(external_id),
            year=2026,
            ementa="Ementa de teste.",
            link=f"https://example.com/{external_id}",
            presentation_date=datetime(2026, 1, day),
            classification="favorable",
        )

    with Session() as session:
        session.add_all(
            [make_bill("1", 1), make_bill("2", 3), make_bill("3", 2)]
        )
        session.commit()

        result = list_bills(page=1, limit=20, session=session)

    assert [bill.external_id for bill in result.items] == ["2", "3", "1"]
