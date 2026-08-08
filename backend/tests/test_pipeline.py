"""
Tests for the daily pipeline orchestrator with mocked scrapers and DB.
"""

from unittest.mock import MagicMock, patch

import pytest

from backend.models import Bill
from backend.pipeline import run_pipeline


def _bill_data(**overrides) -> dict:
    defaults = {
        "external_id": "12345",
        "source": "camara",
        "bill_type": "PL",
        "number": 100,
        "year": 2026,
        "ementa": "Institui política de combate ao desmatamento.",
        "link": "https://camara.leg.br/12345",
        "theme_ids": "48,44",
        "theme_names": "Meio Ambiente,Direitos Humanos",
    }
    defaults.update(overrides)
    return defaults


class TestPipelineBackfill:
    def test_backfills_theme_ids_on_existing_bill(self):
        existing = MagicMock(spec=Bill)
        existing.external_id = "12345"
        existing.source = "camara"
        existing.theme_ids = None
        existing.theme_names = None
        existing.author = "Existing Author"
        existing.author_party = "PT"
        existing.status = "Tramitando"

        session = MagicMock()
        session.query.return_value.filter_by.return_value.first.return_value = existing

        camara_bill = _bill_data(theme_ids="48,44", theme_names="Meio Ambiente,Direitos Humanos")

        with (
            patch("backend.pipeline.SessionLocal", return_value=session),
            patch("backend.pipeline.fetch_camara_bills", return_value=[camara_bill]),
            patch("backend.pipeline.fetch_senado_bills", return_value=[]),
        ):
            result = run_pipeline()

        assert existing.theme_ids == "48,44"
        assert existing.theme_names == "Meio Ambiente,Direitos Humanos"
        assert result["camara_fetched"] == 1
        assert result["new_bills"] == 0

    def test_backfills_missing_author_via_camara_detail(self):
        existing = MagicMock(spec=Bill)
        existing.external_id = "12345"
        existing.source = "camara"
        existing.theme_ids = "48"
        existing.theme_names = "Meio Ambiente"
        existing.author = None
        existing.author_party = None
        existing.author_state = None
        existing.status = "Tramitando"

        session = MagicMock()
        session.query.return_value.filter_by.return_value.first.return_value = existing

        camara_bill = _bill_data()
        camara_detail = {
            "author": "Dep. Maria",
            "author_party": "PSOL",
            "author_state": "RJ",
        }

        with (
            patch("backend.pipeline.SessionLocal", return_value=session),
            patch("backend.pipeline.fetch_camara_bills", return_value=[camara_bill]),
            patch("backend.pipeline.fetch_senado_bills", return_value=[]),
            patch(
                "backend.pipeline.fetch_camara_bill_details",
                return_value=camara_detail,
            ),
        ):
            run_pipeline()

        assert existing.author == "Dep. Maria"
        assert existing.author_party == "PSOL"
        assert existing.author_state == "RJ"

    def test_backfills_missing_author_via_senado_detail(self):
        existing = MagicMock(spec=Bill)
        existing.external_id = "67890"
        existing.source = "senado"
        existing.theme_ids = None
        existing.theme_names = None
        existing.author = None
        existing.author_party = None
        existing.status = None

        session = MagicMock()
        session.query.return_value.filter_by.return_value.first.return_value = existing

        senado_bill = _bill_data(source="senado", external_id="67890")
        senado_detail = {"author": "Sen. Carlos", "status": "Em tramitação"}

        with (
            patch("backend.pipeline.SessionLocal", return_value=session),
            patch("backend.pipeline.fetch_camara_bills", return_value=[]),
            patch("backend.pipeline.fetch_senado_bills", return_value=[senado_bill]),
            patch(
                "backend.pipeline.fetch_senado_bill_details",
                return_value=senado_detail,
            ),
        ):
            run_pipeline()

        assert existing.author == "Sen. Carlos"
        assert existing.status == "Em tramitação"

    def test_creates_new_bill_when_not_existing(self):
        session = MagicMock()
        session.query.return_value.filter_by.return_value.first.return_value = None

        camara_bill = _bill_data()

        with (
            patch("backend.pipeline.SessionLocal", return_value=session),
            patch("backend.pipeline.fetch_camara_bills", return_value=[camara_bill]),
            patch("backend.pipeline.fetch_senado_bills", return_value=[]),
        ):
            result = run_pipeline()

        assert result["new_bills"] == 1
        assert result["classified"] == 1
        session.add.assert_called_once()
        session.commit.assert_called_once()

    def test_handles_empty_fetch(self):
        session = MagicMock()

        with (
            patch("backend.pipeline.SessionLocal", return_value=session),
            patch("backend.pipeline.fetch_camara_bills", return_value=[]),
            patch("backend.pipeline.fetch_senado_bills", return_value=[]),
        ):
            result = run_pipeline()

        assert result["camara_fetched"] == 0
        assert result["senado_fetched"] == 0
        assert result["new_bills"] == 0
        session.commit.assert_not_called()
