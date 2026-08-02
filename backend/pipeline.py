"""
Daily pipeline orchestrator.

Called by GitHub Actions cron daily at 2am BRT (5am UTC).

Flow:
  1. Fetch new bills from Câmara + Senado APIs
  2. Deduplicate against database
  3. Classify each new bill using ensemble
  4. Store results in PostgreSQL
"""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv

from backend.classifiers.ensemble import classify_ensemble
from backend.database import SessionLocal
from backend.models import Bill
from backend.scrapers.camara import fetch_camara_bills, fetch_camara_bill_details
from backend.scrapers.senado import fetch_senado_bills, fetch_senado_bill_details

load_dotenv()


def _parse_date(value: str | None) -> datetime | None:
    if not value or not isinstance(value, str) or not value.strip():
        return None
    try:
        return datetime.fromisoformat(value.strip())
    except (ValueError, TypeError):
        return None


def run_pipeline() -> dict:
    """
    Execute the full daily pipeline.
    Returns a summary dict with counts.
    """
    current_year = datetime.now(timezone.utc).year
    summary = {
        "camara_fetched": 0,
        "senado_fetched": 0,
        "new_bills": 0,
        "classified": 0,
    }

    # Fetch from all sources
    print(f"[pipeline] Fetching bills (year={current_year}) ...")
    camara_bills = fetch_camara_bills(year=current_year, limit=200)
    summary["camara_fetched"] = len(camara_bills)
    print(f"[pipeline] Câmara: {len(camara_bills)} bills found")

    senado_bills = fetch_senado_bills(year=current_year, limit=200)
    summary["senado_fetched"] = len(senado_bills)
    print(f"[pipeline] Senado: {len(senado_bills)} bills found")

    all_bills = camara_bills + senado_bills

    if not all_bills:
        print("[pipeline] No climate-related bills found today.")
        return summary

    session = SessionLocal()

    try:
        for bill_data in all_bills:
            external_id = bill_data["external_id"]
            source = bill_data["source"]

            existing = (
                session.query(Bill)
                .filter_by(external_id=external_id, source=source)
                .first()
            )
            if existing:
                if not existing.theme_ids and bill_data.get("theme_ids"):
                    existing.theme_ids = bill_data["theme_ids"]
                    existing.theme_names = bill_data["theme_names"]
                continue

            summary["new_bills"] += 1

            # Classify using keyword ensemble
            result = classify_ensemble(bill_data["ementa"])

            bill = Bill(
                external_id=external_id,
                source=source,
                bill_type=bill_data["bill_type"],
                number=bill_data["number"],
                year=bill_data["year"],
                ementa=bill_data["ementa"],
                author=bill_data.get("author"),
                presentation_date=_parse_date(bill_data.get("presentation_date")),
                status=bill_data.get("status"),
                link=bill_data["link"],
                theme_ids=bill_data.get("theme_ids"),
                theme_names=bill_data.get("theme_names"),
                keyword_score=result.components.get("keyword_score"),
                final_score=result.final_score,
                classification=result.classification,
                classified_at=datetime.now(timezone.utc),
            )
            session.add(bill)
            summary["classified"] += 1

        session.commit()
        print(f"[pipeline] Done. New: {summary['new_bills']}, "
              f"Classified: {summary['classified']}")

    except Exception as e:
        session.rollback()
        print(f"[pipeline] Error: {e}")
        raise
    finally:
        session.close()

    return summary


if __name__ == "__main__":
    run_pipeline()
