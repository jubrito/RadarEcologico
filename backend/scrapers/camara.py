"""
Scraper for Câmara dos Deputados open data API.

Endpoint: https://dadosabertos.camara.leg.br/api/v2/

Two-phase filtering:
  Phase 1 — API pre-filter by climate-relevant themes (reduces API calls ~90%)
  Phase 2 — Keyword filter on ementa (catches bills misclassified by theme)
"""

from typing import Optional

import requests

API_BASE = "https://dadosabertos.camara.leg.br/api/v2"

# Canonical climate themes shared by both sources (id → display name).
# Most ids are Câmara ``codTema`` codes; "povos_indigenas" is a synthetic id for
# a theme the Câmara folds into "Direitos Humanos e Minorias".
THEME_NAMES: dict[str, str] = {
    "40": "Economia",
    "41": "Cidades e Desenvolvimento Urbano",
    "44": "Direitos Humanos",
    "48": "Meio Ambiente e Desenvolvimento Sustentável",
    "51": "Estrutura Fundiária",
    "54": "Energia, Recursos Hídricos e Minerais",
    "55": "Relações Internacionais e Comércio Exterior",
    "56": "Saúde",
    "61": "Viação, Transporte e Mobilidade",
    "62": "Ciência, Tecnologia e Inovação",
    "64": "Agricultura, Pecuária, Pesca e Extrativismo",
    "66": "Indústria, Comércio e Serviços",
    "70": "Finanças Públicas e Orçamento",
    "76": "Direito e Justiça",
    "povos_indigenas": "Povos Indígenas e Comunidades Tradicionais",
}

# Câmara ``codTema`` → canonical theme id. Codes absent here are not climate themes.
CAMARA_THEME_TO_ID: dict[int, str] = {
    40: "40",
    41: "41",
    44: "44",
    48: "48",
    51: "51",
    54: "54",
    55: "55",
    56: "56",
    61: "61",
    62: "62",
    64: "64",
    66: "66",
    68: "76",  # Direito Constitucional is folded into Direito e Justiça
    70: "70",
    76: "76",
}

from backend.keywords.taxonomy import ementa_matches_climate, is_indigenous
from backend.types import ScrapedBill


def _fetch_themes(external_id: str, ementa: str) -> tuple[str | None, str | None]:
    try:
        response = requests.get(
            f"{API_BASE}/proposicoes/{external_id}/temas", timeout=10
        )
        response.raise_for_status()
        data = response.json()
        temas = data.get("dados", [])
        ids: list[str] = []
        for t in temas:
            code = t.get("codTema", "")
            try:
                theme_id = CAMARA_THEME_TO_ID.get(int(code))
            except (ValueError, TypeError):
                theme_id = None
            if theme_id and theme_id not in ids:
                ids.append(theme_id)
        if is_indigenous(ementa) and "povos_indigenas" not in ids:
            ids.append("povos_indigenas")
        return (
            ",".join(ids) if ids else None,
            ",".join(THEME_NAMES[i] for i in ids) if ids else None,
        )
    except Exception:
        return None, None


def fetch_camara_bills(
    year: int,
    limit: int = 100,
) -> list[ScrapedBill]:
    """
    Fetch bills from Câmara for a given year, filtered by climate keywords.

    Uses the theme pre-filter to reduce API calls dramatically.
    Falls back to unfiltered search if no results for the year.
    """
    bills: list[dict] = []
    seen: set[str] = set()

    bill_types = ["PL", "PLP", "PEC", "MPV"]

    for bill_type in bill_types:
        if len(bills) >= limit:
            break

        url = f"{API_BASE}/proposicoes"
        page = 1

        while len(bills) < limit:
            params = {
                "siglaTipo": bill_type,
                "ano": year,
                "itens": 100,
                "pagina": page,
                "ordem": "ASC",
                "codTema": ",".join(str(k) for k in CAMARA_THEME_TO_ID),
            }

            try:
                response = requests.get(url, params=params, timeout=15)
                response.raise_for_status()
                data = response.json()
            except requests.RequestException as e:
                print(f"  Câmara error (year={year}, type={bill_type}, page={page}): {e}")
                break

            dados = data.get("dados", [])
            if not dados:
                break

            for prop in dados:
                ementa = prop.get("ementa", "")
                if not ementa or not ementa_matches_climate(ementa):
                    continue

                external_id = str(prop.get("id", ""))

                theme_ids_str, theme_names_str = _fetch_themes(external_id, ementa)

                if external_id in seen:
                    continue
                seen.add(external_id)

                bills.append(
                    {
                        "external_id": external_id,
                        "source": "camara",
                        "bill_type": prop.get("siglaTipo", bill_type),
                        "number": prop.get("numero", 0),
                        "year": prop.get("ano", year),
                        "ementa": ementa,
                        "status": (
                            prop.get("statusProposicao", {}).get("descricaoSituacao", "")
                            if prop.get("statusProposicao")
                            else ""
                        ),
                        "presentation_date": prop.get("dataApresentacao"),
                        "link": f"https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao={external_id}",
                        "theme_ids": theme_ids_str,
                        "theme_names": theme_names_str,
                    }
                )

                if len(bills) >= limit:
                    break

            page += 1
            if page > 10:
                break

    return bills


def fetch_camara_bill_details(external_id: str) -> Optional[dict[str, object]]:
    """Fetch full details for a single bill from Câmara, including author party/state."""
    url = f"{API_BASE}/proposicoes/{external_id}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        prop = data.get("dados", {})

        # Fetch author name, party, and state via autores + deputado endpoints
        author_name = ""
        author_party = ""
        author_state = ""

        try:
            aut_response = requests.get(
                f"{API_BASE}/proposicoes/{external_id}/autores", timeout=10
            )
            aut_response.raise_for_status()
            autores = aut_response.json().get("dados", [])
            if autores:
                first = autores[0]
                author_name = first.get("nome", "")
                # Follow deputado URI to get party/state
                deputado_uri = first.get("uri", "")
                if deputado_uri:
                    dep_response = requests.get(deputado_uri, timeout=10)
                    dep_response.raise_for_status()
                    ult = dep_response.json().get("dados", {}).get("ultimoStatus", {})
                    author_party = ult.get("siglaPartido", "")
                    author_state = ult.get("siglaUf", "")
        except requests.RequestException:
            pass  # author fields stay empty if detail calls fail

        return {
            "external_id": external_id,
            "author": author_name,
            "author_party": author_party,
            "author_state": author_state,
            "ementa": prop.get("ementa", ""),
            "status": (
                prop.get("statusProposicao", {}).get("descricaoSituacao", "")
                if prop.get("statusProposicao")
                else ""
            ),
        }
    except requests.RequestException as e:
        print(f"  Câmara detail error (id={external_id}): {e}")
        return None
