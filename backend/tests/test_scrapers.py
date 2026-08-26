"""
Tests for scraper modules using mocked HTTP responses.
"""

from unittest.mock import MagicMock, patch

import pytest

from backend.keywords.taxonomy import ementa_matches_climate, is_comunidade_tradicional
from backend.scrapers.camara import (
    fetch_camara_bill_details,
    fetch_camara_bills,
    fetch_camara_tramitacoes,
)
from backend.scrapers.senado import fetch_senado_bills, fetch_senado_tramitacoes

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

SENADO_PROCESSO_LIST = [
    {
        "id": 9012932,
        "codigoMateria": 173091,
        "identificacao": "PL 1222/2026",
        "ementa": "Institui política de combate ao desmatamento na Amazônia.",
        "dataApresentacao": "2026-03-17",
        "autoria": "Senador Jader Barbalho (MDB/PA)",
        "situacaoAtual": "AGUARDANDO DESIGNAÇÃO DO RELATOR",
        "tramitando": "Sim",
    },
    {
        "id": 9999999,
        "codigoMateria": 999999,
        "identificacao": "REQ 100/2026",
        "ementa": "Institui política de combate ao desmatamento na Amazônia.",
        "autoria": "Senador Fulano",
        "tramitando": "Sim",
    },
    {
        "id": 8888888,
        "codigoMateria": 888888,
        "identificacao": "PL 300/2026",
        "ementa": "Institui o Dia do Professor de Educação Física.",
        "autoria": "Senador Beltrano",
        "tramitando": "Sim",
    },
]

SENADO_PROCESSO_DETAIL = {
    "id": 9012932,
    "codigoMateria": 173091,
    "classificacoes": [
        {"codigo": 33805242, "descricao": "Energia",
         "descricaoHierarquia": "Infraestrutura / Minas e Energia / Energia"},
        {"codigo": 33809769, "descricao": "Desenvolvimento Sustentável",
         "descricaoHierarquia": "Meio Ambiente / Desenvolvimento Sustentável"},
    ],
}


def _make_senado_mock(processo_list: list[dict], detail_map: dict) -> MagicMock:
    """Mock requests.get: list endpoint returns processo_list, detail returns detail_map."""
    def side_effect(url, *args, **kwargs):
        if url.endswith("/processo"):
            return _build_mock_response(processo_list)
        process_id = url.rsplit("/", 1)[-1]
        return _build_mock_response(detail_map.get(process_id, {}))

    mock = MagicMock()
    mock.side_effect = side_effect
    return mock


def _build_mock_response(json_data: dict) -> MagicMock:
    """Build a mock Response for any endpoint."""
    mock = MagicMock()
    mock.json.return_value = json_data
    mock.raise_for_status.return_value = None
    return mock


def _build_camara_list_response(dados: list[dict]) -> MagicMock:
    """Build a mock Response for the Câmara proposicoes list endpoint."""
    mock = MagicMock()
    mock.json.return_value = {"dados": dados}
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


def test_ementa_matches_indigenous_bill():
    """Bills about indigenous/traditional peoples should pass the climate filter."""
    assert ementa_matches_climate(
        "Institui a Política Nacional de Proteção Territorial das "
        "Comunidades Quilombolas."
    ) is True


def test_ementa_matches_fossil_fuel_bill():
    """Bills about fossil fuels should pass the climate filter even without a valence keyword."""
    assert ementa_matches_climate(
        "Regulamenta a exploração e o uso de combustíveis fósseis."
    ) is True
    assert ementa_matches_climate(
        "Dispõe sobre a extração de gás natural no pré-sal."
    ) is True


def test_ementa_matches_transition_and_adaptation():
    """Climate-transition, adaptation and impact topics should pass the filter."""
    assert ementa_matches_climate(
        "Institui a política de transição justa para uma economia de baixo carbono."
    ) is True
    assert ementa_matches_climate(
        "Cria o programa de fomento ao hidrogênio verde."
    ) is True
    assert ementa_matches_climate(
        "Institui o Programa Nacional de Prevenção de Enchentes e Convivência com a Seca."
    ) is True
    assert ementa_matches_climate(
        "Dispõe sobre a resposta a desastres naturais e eventos climáticos extremos."
    ) is True


def test_ementa_matches_wealth_tax_bill():
    """Wealth-tax bills (climate-justice framing) should pass the climate filter."""
    assert ementa_matches_climate(
        "Institui o imposto sobre grandes fortunas."
    ) is True


def test_ementa_matches_market_bill():
    """Market/greenwashing-prone terms should still pass the pre-filter (recall)."""
    assert ementa_matches_climate(
        "Institui o mercado de carbono regulado."
    ) is True


def test_is_comunidade_tradicional():
    assert is_comunidade_tradicional(
        "Proteção aos povos indígenas isolados."
    ) is True
    assert is_comunidade_tradicional(
        "Direitos das comunidades quilombolas e ribeirinhas."
    ) is True
    assert is_comunidade_tradicional(
        "Regulamenta o Estatuto do Índio."
    ) is True
    assert is_comunidade_tradicional(
        "Institui o Dia do Professor."
    ) is False


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


# ── Câmara theme mapping tests ───────────────────────────────────────────────


def test_camara_fetch_bills_merges_constitutional_into_justice():
    """codTema 68 should be folded into the Direito e Justiça theme (76)."""
    themes = {"dados": [{"codTema": 68}, {"codTema": 48}]}

    with patch("backend.scrapers.camara.requests.get",
               _make_camara_mock([CAMARA_BILL_FIXTURE], themes)):
        bills = fetch_camara_bills(2026, limit=10)

    assert bills[0]["theme_ids"] == "76,48"
    assert bills[0]["theme_names"] == (
        "Direito e Justiça,Meio Ambiente e Desenvolvimento Sustentável"
    )


def test_camara_fetch_bills_detects_indigenous_theme():
    """A bill mentioning indigenous peoples should gain the povos_indigenas theme."""
    bill = {
        **CAMARA_BILL_FIXTURE,
        "ementa": "Institui política de proteção aos povos indígenas "
                  "e territórios tradicionais na Amazônia.",
    }
    themes = {"dados": [{"codTema": 44}]}

    with patch("backend.scrapers.camara.requests.get",
               _make_camara_mock([bill], themes)):
        bills = fetch_camara_bills(2026, limit=10)

    assert bills[0]["theme_ids"] == "44,povos_indigenas"


# ── Senado list + theme mapping tests ────────────────────────────────────────


def _fetch_senado(processo_list, detail_map):
    with patch("backend.scrapers.senado.requests.get",
               _make_senado_mock(processo_list, detail_map)):
        return fetch_senado_bills(2026, limit=10)


def test_senado_fetch_bills_filters_sigla_and_keywords():
    """Only PL/PLS/PLC/PLP processos with climate keywords should be returned."""
    bills = _fetch_senado(SENADO_PROCESSO_LIST, {"9012932": SENADO_PROCESSO_DETAIL})

    assert len(bills) == 1
    assert bills[0]["external_id"] == "173091"
    assert bills[0]["source"] == "senado"
    assert bills[0]["bill_type"] == "PL"
    assert bills[0]["number"] == 1222
    assert bills[0]["year"] == 2026


def test_senado_fetch_bills_maps_themes():
    """Classifications should be mapped to Câmara theme codes."""
    bills = _fetch_senado(SENADO_PROCESSO_LIST, {"9012932": SENADO_PROCESSO_DETAIL})

    assert bills[0]["theme_ids"] == "54,48"
    assert bills[0]["theme_names"] == (
        "Energia, Recursos Hídricos e Minerais,"
        "Meio Ambiente e Desenvolvimento Sustentável"
    )


def test_senado_fetch_bills_builds_status_and_metadata():
    """Status, author and date should come from the processo list item."""
    bills = _fetch_senado(SENADO_PROCESSO_LIST, {"9012932": SENADO_PROCESSO_DETAIL})

    assert bills[0]["status"] == "Em tramitação — AGUARDANDO DESIGNAÇÃO DO RELATOR"
    assert bills[0]["author"] == "Senador Jader Barbalho (MDB/PA)"
    assert bills[0]["presentation_date"] == "2026-03-17"


def test_senado_fetch_bills_no_themes_when_classificacoes_empty():
    """Bills without mapped classifications should have no themes."""
    detail = {"id": 9012932, "codigoMateria": 173091, "classificacoes": []}
    bills = _fetch_senado([SENADO_PROCESSO_LIST[0]], {"9012932": detail})

    assert bills[0]["theme_ids"] is None
    assert bills[0]["theme_names"] is None


def test_senado_fetch_bills_deduplicates_theme_codes():
    """Two classes mapping to the same Câmara theme should be deduplicated."""
    detail = {
        "id": 9012932,
        "codigoMateria": 173091,
        "classificacoes": [
            {"codigo": 1, "descricao": "Mudanças Climáticas"},
            {"codigo": 2, "descricao": "Desenvolvimento Sustentável"},
        ],
    }
    bills = _fetch_senado([SENADO_PROCESSO_LIST[0]], {"9012932": detail})

    assert bills[0]["theme_ids"] == "48"


def test_senado_fetch_bills_maps_indigenous_class():
    """The "População Indígena" class should map to the povos_indigenas theme."""
    detail = {
        "id": 9012932,
        "codigoMateria": 173091,
        "classificacoes": [{"codigo": 1, "descricao": "População Indígena"}],
    }
    bills = _fetch_senado([SENADO_PROCESSO_LIST[0]], {"9012932": detail})

    assert bills[0]["theme_ids"] == "povos_indigenas"
    assert bills[0]["theme_names"] == "Povos Indígenas e Comunidades Tradicionais"


def test_senado_fetch_bills_detects_indigenous_from_ementa():
    """An indigenous ementa should add povos_indigenas even without the class."""
    bill = {
        **SENADO_PROCESSO_LIST[0],
        "ementa": "Institui política de proteção aos povos indígenas na Amazônia.",
    }
    detail = {
        "id": 9012932,
        "codigoMateria": 173091,
        "classificacoes": [{"codigo": 1, "descricao": "Mudanças Climáticas"}],
    }
    bills = _fetch_senado([bill], {"9012932": detail})

    assert bills[0]["theme_ids"] == "48,povos_indigenas"


def test_senado_fetch_bills_deduplicates_by_codigo():
    """Duplicate processos (same codigoMateria) should be kept only once."""
    duplicate = [SENADO_PROCESSO_LIST[0], dict(SENADO_PROCESSO_LIST[0])]
    bills = _fetch_senado(duplicate, {"9012932": SENADO_PROCESSO_DETAIL})

    assert len(bills) == 1


def test_senado_fetch_bills_respects_limit():
    """fetch_senado_bills should stop once the limit is reached."""
    many = [
        {**SENADO_PROCESSO_LIST[0],
         "id": 1000 + i, "codigoMateria": 2000 + i,
         "identificacao": f"PL {100 + i}/2026"}
        for i in range(5)
    ]
    detail_map = {str(1000 + i): SENADO_PROCESSO_DETAIL for i in range(5)}

    with patch("backend.scrapers.senado.requests.get",
               _make_senado_mock(many, detail_map)):
        bills = fetch_senado_bills(2026, limit=2)

    assert len(bills) == 2


def test_senado_fetch_bills_returns_empty_on_request_error():
    """A network error should return an empty list, not raise."""
    with patch("backend.scrapers.senado.requests.get",
               side_effect=__import__("requests").RequestException("boom")):
        bills = fetch_senado_bills(2026, limit=10)

    assert bills == []


# ── Tramitação (timeline) tests ───────────────────────────────────────────────


def test_camara_fetch_tramitacoes_extracts_events():
    """Câmara tramitações should map to dated events sorted ascending, with full órgão names."""
    response = _build_mock_response(
        {
            "dados": [
                {"dataHora": "2026-03-10T14:00", "descricaoTramitacao": "Aprovado na Comissão", "siglaOrgao": "CMADS"},
                {"dataHora": "2026-02-02T09:27", "descricaoTramitacao": "Apresentação de Proposição", "siglaOrgao": "MESA"},
            ]
        }
    )

    with patch("backend.scrapers.camara.requests.get", return_value=response):
        eventos = fetch_camara_tramitacoes("12345")

    assert len(eventos) == 2
    assert eventos[0]["date"] == "2026-02-02"
    assert eventos[0]["description"] == "Apresentação de Proposição"
    assert eventos[0]["orgao"] == "Mesa Diretora da Câmara dos Deputados"
    assert eventos[1]["date"] == "2026-03-10"
    assert eventos[1]["orgao"] == "Comissão de Meio Ambiente e Desenvolvimento Sustentável"


def test_camara_fetch_tramitacoes_keeps_unknown_sigla():
    """Unknown órgão siglas should be kept as-is (not dropped)."""
    response = _build_mock_response(
        {"dados": [{"dataHora": "2026-02-02T09:27", "descricaoTramitacao": "X", "siglaOrgao": "XYZ"}]}
    )

    with patch("backend.scrapers.camara.requests.get", return_value=response):
        eventos = fetch_camara_tramitacoes("12345")

    assert eventos[0]["orgao"] == "XYZ"


def test_camara_fetch_tramitacoes_maps_ccp():
    """The CCP sigla should map to its full name."""
    response = _build_mock_response(
        {"dados": [{"dataHora": "2026-02-02T09:27", "descricaoTramitacao": "Encaminhado", "siglaOrgao": "CCP"}]}
    )

    with patch("backend.scrapers.camara.requests.get", return_value=response):
        eventos = fetch_camara_tramitacoes("12345")

    assert eventos[0]["orgao"] == "Coordenação de Comissões Permanentes"


def test_camara_fetch_tramitacoes_returns_empty_on_error():
    """A network error should return an empty list."""
    with patch("backend.scrapers.camara.requests.get",
               side_effect=__import__("requests").RequestException("boom")):
        eventos = fetch_camara_tramitacoes("12345")

    assert eventos == []


def test_senado_fetch_tramitacoes_resolves_and_extracts():
    """Senado tramitação should resolve the process id and map informes legislativos."""
    resolve_response = _build_mock_response([{"id": 9012932}])
    detail_response = _build_mock_response(
        {
            "autuacoes": [
                {
                    "informesLegislativos": [
                        {"data": "2026-05-19 08:40:59", "descricao": "Encerrado o prazo regimental.", "colegiado": {"nome": "Comissão de Assuntos Econômicos"}},
                        {"data": "2026-03-17 16:37:16", "descricao": "Autuado o Projeto de Lei nº 1222/2026.", "colegiado": {"nome": "Plenário do Senado Federal"}},
                    ]
                }
            ]
        }
    )

    with patch("backend.scrapers.senado.requests.get") as mock_get:
        mock_get.side_effect = [resolve_response, detail_response]
        eventos = fetch_senado_tramitacoes("173091")

    assert len(eventos) == 2
    assert eventos[0]["date"] == "2026-03-17"
    assert eventos[0]["description"] == "Autuado o Projeto de Lei nº 1222/2026."
    assert eventos[0]["orgao"] == "Plenário do Senado Federal"
    assert eventos[1]["orgao"] == "Comissão de Assuntos Econômicos"


def test_senado_fetch_tramitacoes_returns_empty_when_unresolvable():
    """When the process id can't be resolved, return an empty list."""
    with patch("backend.scrapers.senado.requests.get",
               return_value=_build_mock_response([])):
        eventos = fetch_senado_tramitacoes("99999")

    assert eventos == []
