"""
Static data exporter.

Reads the classified bills from the database and writes the JSON files that the
static frontend (GitHub Pages) consumes: bills, dashboard stats, and the
pre-fetched tramitação/votation events for each bill.

The frontend is a fully static Next.js export, so there is no API server at
runtime. This script is the single bridge between the daily pipeline (which
scrapes + classifies) and the static site.

Usage (from the repo root):
    python -m backend.pipeline        # populate the DB first
    python -m backend.export_static   # write frontend/public/data/*.json
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
import json

from backend.database import SessionLocal
from backend.models import Bill
from backend.scrapers.camara import (
    THEME_NAMES,
    fetch_camara_tramitacoes,
    fetch_camara_votacoes,
)
from backend.scrapers.senado import fetch_senado_tramitacoes

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = REPO_ROOT / "frontend" / "public" / "data"

# Keep the daily batch small and polite to the public APIs.
MAX_WORKERS = 8


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def serialize_bill(bill: Bill) -> dict:
    """Convert a Bill ORM row into the JSON shape the frontend expects."""
    return {
        "id": bill.id,
        "external_id": bill.external_id,
        "source": bill.source,
        "bill_type": bill.bill_type,
        "number": bill.number,
        "year": bill.year,
        "ementa": bill.ementa,
        "author": bill.author,
        "author_party": bill.author_party,
        "author_state": bill.author_state,
        "presentation_date": _iso(bill.presentation_date),
        "status": bill.status,
        "link": bill.link,
        "theme_ids": bill.theme_ids,
        "theme_names": bill.theme_names,
        "keyword_score": bill.keyword_score,
        "bert_score": bill.bert_score,
        "final_score": bill.final_score,
        "classification": bill.classification,
        "classified_at": _iso(bill.classified_at),
        "created_at": _iso(bill.created_at),
    }


def compute_stats(bills: list[Bill]) -> dict:
    """Compute dashboard stats, mirroring GET /api/stats."""
    by_classification: dict[str, int] = {}
    by_source: dict[str, int] = {}
    by_year: dict[str, int] = {}
    by_party: dict[str, int] = {}
    by_theme: dict[str, int] = {}

    for bill in bills:
        if bill.classification:
            by_classification[bill.classification] = (
                by_classification.get(bill.classification, 0) + 1
            )
        by_source[bill.source] = by_source.get(bill.source, 0) + 1
        by_year[str(bill.year)] = by_year.get(str(bill.year), 0) + 1
        if bill.author_party:
            by_party[bill.author_party] = by_party.get(bill.author_party, 0) + 1

    for theme_id in THEME_NAMES:
        by_theme[theme_id] = sum(
            1
            for bill in bills
            if bill.theme_ids and theme_id in bill.theme_ids
        )

    return {
        "total_bills": len(bills),
        "by_classification": by_classification,
        "by_source": by_source,
        "by_year": by_year,
        "by_theme": by_theme,
        "by_party": by_party,
    }


def _fetch_events(bill: Bill) -> tuple[str, list, list]:
    """Fetch tramitação + votation events for a single bill from its source API."""
    if bill.source == "camara":
        return (
            bill.id,
            fetch_camara_tramitacoes(bill.external_id),
            fetch_camara_votacoes(bill.external_id),
        )
    if bill.source == "senado":
        return (
            bill.id,
            fetch_senado_tramitacoes(bill.external_id),
            [],
        )
    return bill.id, [], []


def fetch_events(bills: list[Bill]) -> tuple[dict[str, list], dict[str, list]]:
    """Fetch tramitação/votation events for all bills, in parallel."""
    tramitacoes: dict[str, list] = {}
    votacoes: dict[str, list] = {}
    if not bills:
        return tramitacoes, votacoes

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        results = list(pool.map(_fetch_events, bills))

    for bill_id, events, votacoes_data in results:
        tramitacoes[bill_id] = events
        votacoes[bill_id] = votacoes_data
    return tramitacoes, votacoes


def _write_json(output_dir: Path, name: str, payload: object) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    with (output_dir / name).open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))


def export_static(output_dir: Path = OUTPUT_DIR) -> dict:
    """Export all data to JSON files. Returns a summary of what was written."""
    session = SessionLocal()
    try:
        bills = session.query(Bill).order_by(Bill.presentation_date.desc()).all()
    finally:
        session.close()

    stats = compute_stats(bills)
    tramitacoes, votacoes = fetch_events(bills)

    _write_json(output_dir, "bills.json", [serialize_bill(b) for b in bills])
    _write_json(output_dir, "stats.json", stats)
    _write_json(output_dir, "tramitacoes.json", tramitacoes)
    _write_json(output_dir, "votacoes.json", votacoes)

    return {
        "bills": len(bills),
        "tramitacoes": sum(len(v) for v in tramitacoes.values()),
        "votacoes": sum(len(v) for v in votacoes.values()),
    }


if __name__ == "__main__":
    summary = export_static()
    print(
        f"[export] bills={summary['bills']} "
        f"tramitacoes={summary['tramitacoes']} "
        f"votacoes={summary['votacoes']}"
    )
