"""
Scraper for Senado Federal open data API.

Endpoint: https://legis.senado.leg.br/dadosabertos/

Uses the current ``/processo`` API (the ``/materia`` endpoints were deprecated
and deactivated). Key features:
  - Lists processos by year (``/processo?ano=YYYY``)
  - Filters by sigla (PL, PLS, PLC, PLP)
  - Filters results by climate keywords in ementa
  - Maps the bill's "Classificação Temática Unificada" to a canonical theme id
    (``SENADO_CLASS_TO_THEME``) so both sources share the same themes.
"""

import re
from typing import Optional

import requests

from backend.keywords.taxonomy import ementa_matches_climate, is_comunidade_tradicional
from backend.scrapers.camara import THEME_NAMES
from backend.types import ScrapedBill

API_BASE = "https://legis.senado.leg.br/dadosabertos"

SENADO_SIGLAS = ("PL", "PLS", "PLC", "PLP")

# Curated mapping: Senado leaf class name ("descricao") → canonical theme id.
# Only the climate-relevant subset is mapped; everything else is ignored.
# Keyed by name (not the Senado numeric code) so it survives taxonomy changes.
SENADO_CLASS_TO_THEME: dict[str, str] = {
    # Meio Ambiente
    "Crimes e Infrações Ambientais": "48",
    "Desenvolvimento Sustentável": "48",
    "Espaços Especialmente Protegidos": "48",
    "Licenciamento Ambiental": "48",
    "Mudanças Climáticas": "48",
    "Patrimônio Genético": "48",
    "Poluição": "48",
    "Proteção aos Animais": "48",
    "Resíduos Sólidos": "48",
    "Vegetação Nativa": "48",
    # Infraestrutura
    "Energia": "54",
    "Mineração": "54",
    "Recursos Hídricos": "54",
    "Transporte Aéreo": "61",
    "Transporte Hidroviário": "61",
    "Transporte Terrestre": "61",
    # Economia e Desenvolvimento
    "Agropecuária e Abastecimento": "64",
    "Ciência, Tecnologia e Informática": "62",
    "Desenvolvimento Regional": "40",
    "Finanças Públicas": "70",
    "Indústria, Comércio e Serviços": "66",
    "Política Fundiária e Reforma Agrária": "51",
    # Política Social
    "Combate a Epidemias e Pandemias": "56",
    "Defesa e Vigilância Sanitária": "56",
    "Direitos Humanos e Minorias": "44",
    "Mobilidade Urbana": "61",
    "População Indígena": "povos_indigenas",
    "Saneamento Básico": "41",
    "Saúde Pública": "56",
    "Saúde Suplementar": "56",
    # Orçamento Público
    "Crédito Adicional": "70",
    "Diretrizes Orçamentárias": "70",
    "Orçamento Anual": "70",
    "Plano Plurianual (PPA)": "70",
    # Soberania, Defesa Nacional e Ordem Pública
    "Relações Internacionais": "55",
}

_IDENTIFICACAO_RE = re.compile(r"^(\S+)\s+(\d+)/(\d+)$")


def _parse_identificacao(identificacao: str) -> Optional[tuple[str, int, int]]:
    """Parse "PL 1222/2026" into (sigla, numero, ano)."""
    match = _IDENTIFICACAO_RE.match(identificacao.strip())
    if not match:
        return None
    sigla, numero, ano = match.groups()
    return sigla, int(numero), int(ano)


def _build_status(tramitando: str, situacao: str) -> Optional[str]:
    """Combine the tramitação indicator and the current situation into a status."""
    if tramitando == "Sim":
        base = "Em tramitação"
    elif tramitando == "Não":
        base = "Tramitação encerrada"
    else:
        base = ""
    parts = [p for p in (base, situacao) if p]
    return " — ".join(parts) if parts else None


def _map_themes(
    classificacoes: list[dict], ementa: str
) -> tuple[Optional[str], Optional[str]]:
    """Map Senado classifications to (theme_ids, theme_names) using the curated table."""
    ids: list[str] = []
    for classificacao in classificacoes or []:
        descricao = (classificacao.get("descricao") or "").strip()
        theme_id = SENADO_CLASS_TO_THEME.get(descricao)
        if theme_id is None or theme_id in ids:
            continue
        ids.append(theme_id)
    if is_comunidade_tradicional(ementa) and "povos_indigenas" not in ids:
        ids.append("povos_indigenas")
    return (
        ",".join(ids) if ids else None,
        ",".join(THEME_NAMES[theme_id] for theme_id in ids) if ids else None,
    )


def _fetch_themes(process_id: str, ementa: str) -> tuple[Optional[str], Optional[str]]:
    """Fetch a processo detail and return its mapped themes."""
    try:
        response = requests.get(
            f"{API_BASE}/processo/{process_id}",
            headers={"Accept": "application/json"},
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        return _map_themes(data.get("classificacoes", []), ementa)
    except requests.RequestException:
        return None, None


def fetch_senado_bills(
    year: int,
    limit: int = 100,
) -> list[ScrapedBill]:
    """
    Fetch bills from Senado for a given year, filtered by climate keywords.

    For each climate-relevant bill, also fetches its classifications (themes)
    from the processo detail endpoint and maps them to Câmara theme codes.
    """
    bills: list[dict] = []
    seen: set[str] = set()
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(
            f"{API_BASE}/processo",
            params={"ano": str(year)},
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"  Senado error (year={year}): {e}")
        return bills

    if not isinstance(data, list):
        return bills

    for item in data:
        if not isinstance(item, dict):
            continue

        parsed = _parse_identificacao(item.get("identificacao", ""))
        if parsed is None:
            continue
        sigla, numero, ano = parsed
        if sigla not in SENADO_SIGLAS:
            continue

        ementa = item.get("ementa", "")
        if not ementa or not ementa_matches_climate(ementa):
            continue

        codigo = str(item.get("codigoMateria", ""))
        if not codigo or codigo in seen:
            continue
        seen.add(codigo)

        theme_ids, theme_names = _fetch_themes(str(item.get("id", "")), ementa)

        bills.append(
            {
                "external_id": codigo,
                "source": "senado",
                "bill_type": sigla,
                "number": numero,
                "year": ano,
                "ementa": ementa,
                "author": item.get("autoria", ""),
                "presentation_date": item.get("dataApresentacao", ""),
                "status": _build_status(
                    item.get("tramitando", ""), item.get("situacaoAtual", "")
                ),
                "link": (
                    "https://www25.senado.leg.br/web/atividade/materias/-/materia/"
                    f"{codigo}"
                ),
                "theme_ids": theme_ids,
                "theme_names": theme_names,
            }
        )

        if len(bills) >= limit:
            break

    return bills
