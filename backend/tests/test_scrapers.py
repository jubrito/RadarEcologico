"""
Tests for scraper modules using mocked HTTP responses.
"""

from unittest.mock import MagicMock, patch

import pytest

from backend.keywords.taxonomy import ementa_matches_climate
from backend.scrapers.camara import fetch_camara_bills, fetch_camara_bill_details
from backend.scrapers.senado import fetch_senado_bill_details, fetch_senado_bills

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


SENADO_LIST_FIXTURE = {
    "PesquisaBasicaMateria": {
        "Materias": {
            "Materia": [
                {
                    "Sigla": "PL",
                    "Numero": 100,
                    "Ano": 2026,
                    "Ementa": "Institui política de combate ao desmatamento na Amazônia.",
                    "Codigo": "12345",
                    "Autor": "Sen. João Silva",
                    "Data": "2026-01-15",
                },
                {
                    "Sigla": "REQ",
                    "Numero": 200,
                    "Ano": 2026,
                    "Ementa": "Institui política de combate ao desmatamento na Amazônia.",
                    "Codigo": "99999",
                    "Autor": "Sen. Maria",
                    "Data": "2026-01-16",
                },
                {
                    "Sigla": "PL",
                    "Numero": 300,
                    "Ano": 2026,
                    "Ementa": "Institui o Dia do Professor de Educação Física.",
                    "Codigo": "77777",
                    "Autor": "Sen. José",
                    "Data": "2026-01-17",
                },
            ]
        }
    }
}


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


def test_camara_fetch_bill_details_extracts_author_party_state():
    """Author, party and state should come from autores + deputado endpoints."""
    detail_response = _build_mock_response(CAMARA_DETAIL_FIXTURE)
    autores_response = _build_mock_response(
        {"dados": [{"nome": "João da Silva", "uri": "https://dadosabertos.camara.leg.br/api/v2/deputados/1"}]}
    )
    deputado_response = _build_mock_response(
        {"dados": {"ultimoStatus": {"siglaPartido": "PT", "siglaUf": "SP"}}}
    )

    with patch("backend.scrapers.camara.requests.get") as mock_get:
        mock_get.side_effect = [detail_response, autores_response, deputado_response]

        details = fetch_camara_bill_details("12345")

    assert details is not None
    assert details["author"] == "João da Silva"
    assert details["author_party"] == "PT"
    assert details["author_state"] == "SP"


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


# ── Senado list tests ────────────────────────────────────────────────────────


def test_senado_fetch_bills_filters_sigla_and_keywords():
    """Only PL/PLC/PLS/PLP matérias with climate keywords should be returned."""
    with patch("backend.scrapers.senado.requests.get",
               return_value=_build_mock_response(SENADO_LIST_FIXTURE)):
        bills = fetch_senado_bills(2026, limit=10)

    assert len(bills) == 1
    assert bills[0]["external_id"] == "12345"
    assert bills[0]["source"] == "senado"
    assert bills[0]["bill_type"] == "PL"
    assert bills[0]["number"] == 100


def test_senado_fetch_bills_handles_single_materia_dict():
    """A single matière returned as a dict (not a list) should still parse."""
    materia = SENADO_LIST_FIXTURE["PesquisaBasicaMateria"]["Materias"]["Materia"][0]
    fixture = {"PesquisaBasicaMateria": {"Materias": {"Materia": materia}}}

    with patch("backend.scrapers.senado.requests.get",
               return_value=_build_mock_response(fixture)):
        bills = fetch_senado_bills(2026, limit=10)

    assert len(bills) == 1
    assert bills[0]["external_id"] == "12345"


def test_senado_fetch_bills_deduplicates_by_codigo():
    """Duplicate matérias (same Codigo) should be kept only once."""
    materia = SENADO_LIST_FIXTURE["PesquisaBasicaMateria"]["Materias"]["Materia"][0]
    fixture = {
        "PesquisaBasicaMateria": {
            "Materias": {"Materia": [materia, dict(materia)]}
        }
    }

    with patch("backend.scrapers.senado.requests.get",
               return_value=_build_mock_response(fixture)):
        bills = fetch_senado_bills(2026, limit=10)

    assert len(bills) == 1


def test_senado_fetch_bills_respects_limit():
    """fetch_senado_bills should stop once the limit is reached."""
    materia = SENADO_LIST_FIXTURE["PesquisaBasicaMateria"]["Materias"]["Materia"][0]
    many = [
        {**materia, "Codigo": str(1000 + i), "Numero": 100 + i} for i in range(5)
    ]
    fixture = {"PesquisaBasicaMateria": {"Materias": {"Materia": many}}}

    with patch("backend.scrapers.senado.requests.get",
               return_value=_build_mock_response(fixture)):
        bills = fetch_senado_bills(2026, limit=2)

    assert len(bills) == 2


def test_senado_fetch_bills_returns_empty_on_request_error():
    """A network error should return an empty list, not raise."""
    with patch("backend.scrapers.senado.requests.get",
               side_effect=__import__("requests").RequestException("boom")):
        bills = fetch_senado_bills(2026, limit=10)

    assert bills == []
