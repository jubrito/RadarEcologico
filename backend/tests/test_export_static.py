"""
Tests for the static data exporter.
"""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from backend.export_static import (
    compute_stats,
    export_static,
    fetch_reviews,
    serialize_bill,
)
from backend.models import Bill


def _bill(**overrides) -> Bill:
    defaults = {
        "id": "abc-123",
        "external_id": "12345",
        "source": "camara",
        "bill_type": "PL",
        "number": 100,
        "year": 2026,
        "ementa": "Combate ao desmatamento.",
        "author": "Dep. João",
        "author_party": "PT",
        "author_state": "SP",
        "presentation_date": datetime(2026, 1, 15, tzinfo=timezone.utc),
        "status": "Tramitando",
        "link": "https://camara.leg.br/12345",
        "theme_ids": "48,44",
        "theme_names": "Meio Ambiente,Direitos Humanos",
        "keyword_score": 0.12,
        "bert_score": None,
        "final_score": 0.12,
        "classification": "favorable",
        "classified_at": datetime(2026, 8, 2, tzinfo=timezone.utc),
        "created_at": datetime(2026, 8, 1, tzinfo=timezone.utc),
    }
    defaults.update(overrides)
    return Bill(**defaults)


def test_serialize_bill_iso_dates():
    result = serialize_bill(_bill())
    assert result["id"] == "abc-123"
    assert result["classification"] == "favorable"
    assert result["presentation_date"] == "2026-01-15T00:00:00+00:00"
    assert result["theme_ids"] == "48,44"


def test_serialize_bill_nullable_dates():
    result = serialize_bill(
        _bill(presentation_date=None, classified_at=None, created_at=None)
    )
    assert result["presentation_date"] is None
    assert result["classified_at"] is None


def test_compute_stats():
    bills = [
        _bill(
            id="1",
            classification="favorable",
            source="camara",
            theme_ids="48",
            author_party="PT",
        ),
        _bill(
            id="2",
            classification="unfavorable",
            source="senado",
            theme_ids="54",
            author_party="PL",
        ),
        _bill(
            id="3",
            classification="favorable",
            source="camara",
            theme_ids="48,54",
            author_party=None,
        ),
    ]
    stats = compute_stats(bills)
    assert stats["total_bills"] == 3
    assert stats["by_classification"] == {"favorable": 2, "unfavorable": 1}
    assert stats["by_source"] == {"camara": 2, "senado": 1}
    assert stats["by_party"] == {"PT": 1, "PL": 1}
    assert stats["by_theme"]["48"] == 2
    assert stats["by_theme"]["54"] == 2


def test_export_static_writes_files(tmp_path):
    session = MagicMock()
    session.query.return_value.order_by.return_value.all.return_value = [_bill()]

    with (
        patch("backend.export_static.SessionLocal", return_value=session),
        patch("backend.export_static.fetch_events", return_value=({}, {})),
    ):
        summary = export_static(output_dir=tmp_path)

    assert summary["bills"] == 1
    for name in ("bills.json", "stats.json", "tramitacoes.json", "votacoes.json"):
        assert (tmp_path / name).exists()


def test_serialize_bill_with_review():
    review = {
        "reviewer_classification": "neutral",
        "reviewer_score": 50,
        "reviewed_by": "ana@example.com",
        "reviewed_at": "2026-08-28T00:00:00+00:00",
    }
    result = serialize_bill(_bill(), review)
    assert result["reviewed"] is True
    assert result["reviewed_classification"] == "neutral"
    assert result["reviewed_score"] == 50
    assert result["reviewed_by"] == "ana@example.com"
    assert result["reviewed_at"] == "2026-08-28T00:00:00+00:00"


def test_serialize_bill_without_review():
    result = serialize_bill(_bill())
    assert result["reviewed"] is False


def test_fetch_reviews_unconfigured():
    with patch("backend.export_static.SUPABASE_URL", ""):
        assert fetch_reviews() == {}


def test_fetch_reviews_parses_rows():
    rows = [
        {"source": "camara", "external_id": "12345", "reviewer_score": 80},
        {"source": "senado", "external_id": "67890", "reviewer_score": 20},
    ]
    mock = MagicMock()
    mock.json.return_value = rows
    mock.raise_for_status.return_value = None

    with (
        patch("backend.export_static.SUPABASE_URL", "https://x.supabase.co"),
        patch("backend.export_static.SUPABASE_SERVICE_ROLE_KEY", "key"),
        patch("backend.export_static.requests.get", return_value=mock),
    ):
        reviews = fetch_reviews()

    assert ("camara", "12345") in reviews
    assert reviews[("camara", "12345")]["reviewer_score"] == 80
    assert ("senado", "67890") in reviews
