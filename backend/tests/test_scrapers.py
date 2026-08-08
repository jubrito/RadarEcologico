"""
Tests for scraper modules using mocked HTTP responses.
"""

from unittest.mock import MagicMock, patch

import pytest

from backend.keywords.taxonomy import ementa_matches_climate
from backend.scrapers.camara import fetch_camara_bills, fetch_camara_bill_details
from backend.scrapers.senado import fetch_senado_bill_details

# ── Helpers ──────────────────────────────────────────────────────────────────

CAMARA_BILL_FIXTURE = {
    "id": 12345,
    "siglaTipo": "PL",
    "numero": 456,
    "ano": 2026,
    "ementa": "Institui política de combate ao desmatamento na Amazônia.",
    "dataApresentacao": "2026-01-15",
    "statusProposicao": {
        "descricaoSituacao": "Aguardando Parecer do Relator na Comissão de Meio Ambiente"
    },
}

CAMARA_THEMES_FIXTURE = {
    "dados": [
        {"codTema": 48},
        {"codTema": 54},
    ]
}

CAMARA_DETAIL_FIXTURE = {
    "dados": {
        "ementa": "Institui política de combate ao desmatamento na Amazônia.",
        "textoIntegral": "Texto completo do projeto...",
        "statusProposicao": {
            "descricaoSituacao": "Aprovado na Câmara, encaminhado ao Senado"
        },
    }
}

SENADO_DETAIL_FIXTURE = {
    "DetalheMateria": {
        "Materia": {
            "DadosBasicosMateria": {
                "EmentaMateria": "Institui política nacional de pagamento por serviços ambientais.",
                "Autor": "Sen. João Silva",
            },
            "DecisaoEDestino": {
                "Decisao": {
                    "Descricao": "Aprovado pelo Plenário"
                }
            },
            "IdentificacaoMateria": {
                "IndicadorTramitando": "Sim"
            },
            "ExplicacaoEmenta": "Explicação detalhada..."
        }
    }
}


def _build_camara_list_response(dados: list[dict]) -> MagicMock:
    """Build a mock Response for the Câmara proposicoes list endpoint."""
    mock = MagicMock()
    mock.json.return_value = {"dados": dados}
    mock.raise_for_status.return_value = None
    return mock


def _build_mock_response(json_data: dict) -> MagicMock:
    """Build a mock Response for any endpoint."""
    mock = MagicMock()
    mock.json.return_value = json_data
    mock.raise_for_status.return_value = None
    return mock


# ── Ementa matching tests ────────────────────────────────────────────────────


def test_ementa_matches_positive_keyword():
    assert ementa_matches_climate(
        "Institui política de combate ao desmatamento na Amazônia."
    ) is True


def test_ementa_matches_negative_keyword():
    assert ementa_matches_climate(
        "Flexibiliza licenciamento ambiental para obras públicas."
    ) is True


def test_ementa_no_match():
    assert ementa_matches_climate(
        "Institui o Dia Nacional do Professor de Educação Física."
    ) is False


def test_ementa_empty_string():
    assert ementa_matches_climate("") is False


def _make_camara_mock(first_page: list[dict], themes: dict) -> MagicMock:
    """Return a mock for requests.get that returns data on page 1 and empty on subsequent pages."""
    empty = _build_camara_list_response([])

    def side_effect(url, *args, **kwargs):
        if "/temas" in url:
            return _build_mock_response(themes)
        params = kwargs.get("params", {})
        page = params.get("pagina", 1)
        if page == 1:
            return _build_camara_list_response(first_page)
        return empty

    mock = MagicMock()
    mock.side_effect = side_effect
    return mock


# ── Câmara status extraction tests ──────────────────────────────────────────


def test_camara_fetch_bills_extracts_status():
    """The status field should be extracted from statusProposicao.descricaoSituacao."""
    with patch("backend.scrapers.camara.requests.get",
               _make_camara_mock([CAMARA_BILL_FIXTURE], CAMARA_THEMES_FIXTURE)):
        bills = fetch_camara_bills(2026, limit=10)

    assert len(bills) == 1
    assert bills[0]["status"] == "Aguardando Parecer do Relator na Comissão de Meio Ambiente"


def test_camara_fetch_bills_status_empty_when_missing():
    """Status should be an empty string when statusProposicao is absent."""
    bill_no_status = {**CAMARA_BILL_FIXTURE}
    del bill_no_status["statusProposicao"]

    with patch("backend.scrapers.camara.requests.get",
               _make_camara_mock([bill_no_status], CAMARA_THEMES_FIXTURE)):
        bills = fetch_camara_bills(2026, limit=10)

    assert len(bills) == 1
    assert bills[0]["status"] == ""


def test_camara_fetch_bills_status_empty_when_none():
    """Status should be an empty string when statusProposicao is None."""
    bill_none_status = {**CAMARA_BILL_FIXTURE, "statusProposicao": None}

    with patch("backend.scrapers.camara.requests.get",
               _make_camara_mock([bill_none_status], CAMARA_THEMES_FIXTURE)):
        bills = fetch_camara_bills(2026, limit=10)

    assert len(bills) == 1
    assert bills[0]["status"] == ""


def test_camara_fetch_bill_details_extracts_status():
    """fetch_camara_bill_details should extract status from the detail endpoint."""
    detail_response = _build_mock_response(CAMARA_DETAIL_FIXTURE)
    autores_response = _build_mock_response({"dados": []})

    with patch("backend.scrapers.camara.requests.get") as mock_get:
        mock_get.side_effect = [detail_response, autores_response]

        details = fetch_camara_bill_details("12345")

    assert details is not None
    assert details["status"] == "Aprovado na Câmara, encaminhado ao Senado"


def test_camara_fetch_bill_details_status_empty_when_missing():
    """Status should be empty when statusProposicao is missing from detail."""
    detail_no_status = {"dados": {"ementa": "Ementa qualquer."}}

    detail_response = _build_mock_response(detail_no_status)
    autores_response = _build_mock_response({"dados": []})

    with patch("backend.scrapers.camara.requests.get") as mock_get:
        mock_get.side_effect = [detail_response, autores_response]

        details = fetch_camara_bill_details("12345")

    assert details is not None
    assert details["status"] == ""


# ── Senado status extraction tests ───────────────────────────────────────────


def test_senado_fetch_bill_details_builds_status_tramitando():
    """Senado status should combine tramitação indicator and decision text."""
    detail_response = _build_mock_response(SENADO_DETAIL_FIXTURE)

    with patch("backend.scrapers.senado.requests.get", return_value=detail_response):
        details = fetch_senado_bill_details("12345")

    assert details is not None
    assert details["status"] == "Em tramitação — Aprovado pelo Plenário"


def test_senado_fetch_bill_details_status_encerrada():
    """When IndicadorTramitando is 'Não', status should say tramitação encerrada."""
    fixture = {
        "DetalheMateria": {
            "Materia": {
                "DadosBasicosMateria": {
                    "EmentaMateria": "Teste.",
                    "Autor": "Sen. Maria",
                },
                "DecisaoEDestino": {
                    "Decisao": {"Descricao": "Arquivado"}
                },
                "IdentificacaoMateria": {
                    "IndicadorTramitando": "Não"
                },
                "ExplicacaoEmenta": "",
            }
        }
    }

    detail_response = _build_mock_response(fixture)

    with patch("backend.scrapers.senado.requests.get", return_value=detail_response):
        details = fetch_senado_bill_details("67890")

    assert details is not None
    assert details["status"] == "Tramitação encerrada — Arquivado"


def test_senado_fetch_bill_details_status_none_when_empty():
    """Status should be None when both tramitação and decisão are empty."""
    fixture = {
        "DetalheMateria": {
            "Materia": {
                "DadosBasicosMateria": {
                    "EmentaMateria": "Teste.",
                    "Autor": "Sen. José",
                },
                "DecisaoEDestino": {
                    "Decisao": {"Descricao": ""}
                },
                "IdentificacaoMateria": {
                    "IndicadorTramitando": ""
                },
                "ExplicacaoEmenta": "",
            }
        }
    }

    detail_response = _build_mock_response(fixture)

    with patch("backend.scrapers.senado.requests.get", return_value=detail_response):
        details = fetch_senado_bill_details("11111")

    assert details is not None
    assert details["status"] is None
