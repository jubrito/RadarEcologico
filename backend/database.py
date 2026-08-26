"""
Database connection and session management.

Uses SQLAlchemy 2.0 (SQLite in dev, PostgreSQL in prod).
Set DATABASE_URL in environment or .env file.
"""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.models import Base

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./radar.db",
)

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=0,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_session() -> Generator[Session, None, None]:
    """Yield a database session. Use as FastAPI dependency."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def create_tables() -> None:
    """Create tables if they don't exist (bootstrap local dev; Alembic later)."""
    Base.metadata.create_all(bind=engine)
