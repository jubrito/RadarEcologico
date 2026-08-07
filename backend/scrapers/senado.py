"""
Scraper for Senado Federal open data API.

Endpoint: https://legis.senado.leg.br/dadosabertos/

Key features:
  - Searches matérias legislativas by year
  - Filters by sigla (PLS, PLC, PL, PLP)
  - Filters results by climate keywords in ementa
"""

from typing import Optional

import requests

API_BASE = "https://legis.senado.leg.br/dadosabertos"

from backend.keywords.taxonomy import ementa_matches_climate


def fetch_senado_bills(
    year: int,
    limit: int = 100,
) -> list[dict]:
    """
    Fetch bills from Senado for a given year, filtered by climate keywords.
    """
    bills: list[dict] = []
    seen: set[str] = set()

    url = f"{API_BASE}/materia/pesquisa/lista"
    params = {"ano": str(year)}
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"  Senado error (year={year}): {e}")
        return bills

    pesquisa = data.get("PesquisaBasicaMateria", {})
    materias_data = pesquisa.get("Materias", {})

    if isinstance(materias_data, dict):
        materias = materias_data.get("Materia", [])
    else:
        materias = materias_data

    if isinstance(materias, dict):
        materias = [materias]

    for materia in materias:
        if not isinstance(materia, dict):
            continue

        sigla = materia.get("Sigla", "")
        if sigla not in ("PLS", "PLC", "PL", "PLP"):
            continue

        ementa = materia.get("Ementa", "")
        if not ementa or not ementa_matches_climate(ementa):
            continue

        codigo = str(materia.get("Codigo", ""))
        if codigo in seen:
            continue
        seen.add(codigo)

        bills.append(
            {
                "external_id": codigo,
                "source": "senado",
                "bill_type": sigla,
                "number": materia.get("Numero", 0),
                "year": materia.get("Ano", year),
                "ementa": ementa,
                "author": materia.get("Autor", ""),
                "presentation_date": materia.get("Data", ""),
                "link": f"https://www25.senado.leg.br/web/atividade/materias/-/materia/{codigo}",
            }
        )

        if len(bills) >= limit:
            break

    return bills


def fetch_senado_bill_details(codigo: str) -> Optional[dict]:
    """Fetch full details for a single bill from Senado, including status."""
    url = f"{API_BASE}/materia/{codigo}"
    headers = {"Accept": "application/json"}
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        materia = (
            data.get("DetalheMateria", {})
            .get("Materia", {})
        )

        dados = materia.get("DadosBasicosMateria", {})
        decisao = materia.get("DecisaoEDestino", {}).get("Decisao", {})
        ident = materia.get("IdentificacaoMateria", {})

        # Build status from decision info
        tramitando = ident.get("IndicadorTramitando", "")
        decisao_desc = decisao.get("Descricao", "")
        status_parts = []
        if tramitando == "Sim":
            status_parts.append("Em tramitação")
        elif tramitando == "Não":
            status_parts.append("Tramitação encerrada")
        if decisao_desc:
            status_parts.append(decisao_desc)
        status = " — ".join(status_parts) if status_parts else None

        return {
            "external_id": codigo,
            "full_text": materia.get("ExplicacaoEmenta", ""),
            "ementa": dados.get("EmentaMateria", ""),
            "author": dados.get("Autor", ""),
            "status": status,
        }
    except requests.RequestException as e:
        print(f"  Senado detail error (codigo={codigo}): {e}")
        return None
