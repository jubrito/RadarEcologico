"""
FastAPI application entrypoint.

Single-process backend that serves:
  - REST API for the frontend
  - AI classification (keyword-first, BERT in Phase 2)
  - Scraping pipeline (via GitHub Actions cron)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.database import create_tables

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown events. Creates tables if the DB is reachable."""
    try:
        create_tables()
    except Exception as exc:  # noqa: BLE001 — DB may be offline during dev
        logger.warning(
            "Banco de dados indisponível no startup (%s). "
            "Ajuste DATABASE_URL e reinicie o backend.",
            exc,
        )
    yield


app = FastAPI(
    title="Radar Legislativo Climático",
    description="API for the Climate Legislative Radar — tracks and classifies "
    "Brazilian bills related to climate change.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "radar-ecologico"}
