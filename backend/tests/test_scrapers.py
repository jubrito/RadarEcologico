"""
Tests for scraper modules using mocked HTTP responses.
"""

import pytest

from backend.scrapers.camara import _ementa_matches_climate


# --- Ementa matching tests ---


def test_ementa_matches_positive_keyword():
    assert _ementa_matches_climate(
        "Institui política de combate ao desmatamento na Amazônia."
    ) is True


def test_ementa_matches_negative_keyword():
    assert _ementa_matches_climate(
        "Flexibiliza licenciamento ambiental para obras públicas."
    ) is True


def test_ementa_no_match():
    assert _ementa_matches_climate(
        "Institui o Dia Nacional do Professor de Educação Física."
    ) is False


def test_ementa_empty_string():
    assert _ementa_matches_climate("") is False
