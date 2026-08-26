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

# Climate-relevant theme codes from Câmara API.
# Source: https://dadosabertos.camara.leg.br/api/v2/referencias/proposicoes/codTema
#
# Direct: environment, energy, water, agriculture, land, cities, transport, indigenous.
# Indirect: economy (carbon pricing, green subsidies), international (climate treaties),
#   health (environmental), science (cleantech), industry (emissions, green standards),
#   constitutional (environmental rights), justice (environmental crimes).
CLIMATE_THEME_MAP: dict[int, str] = {
    48: "Meio Ambiente e Desenvolvimento Sustentável",
    54: "Energia, Recursos Hídricos e Minerais",
    64: "Agricultura, Pecuária, Pesca e Extrativismo",
    51: "Estrutura Fundiária",
    61: "Viação, Transporte e Mobilidade",
    44: "Direitos Humanos e Minorias",
    70: "Finanças Públicas e Orçamento",
    41: "Cidades e Desenvolvimento Urbano",
    40: "Economia",
    55: "Relações Internacionais e Comércio Exterior",
    56: "Saúde",
    62: "Ciência, Tecnologia e Inovação",
    66: "Indústria, Comércio e Serviços",
    68: "Direito Constitucional",
    76: "Direito e Justiça",
}

from backend.keywords.taxonomy import ementa_matches_climate
from backend.types import ScrapedBill


def _fetch_themes(external_id: str) -> tuple[str | None, str | None]:
    try:
        response = requests.get(
            f"{API_BASE}/proposicoes/{external_id}/temas", timeout=10
        )
        response.raise_for_status()
        data = response.json()
        temas = data.get("dados", [])
        if not temas:
            return None, None
        codes = []
        names = []
        for t in temas:
            code = str(t.get("codTema", ""))
            if code and int(code) in CLIMATE_THEME_MAP:
                codes.append(code)
                names.append(CLIMATE_THEME_MAP[int(code)])
        return (",".join(codes) if codes else None,
                ",".join(names) if names else None)
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
                "codTema": ",".join(str(k) for k in CLIMATE_THEME_MAP),
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

                theme_ids_str, theme_names_str = _fetch_themes(external_id)

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
