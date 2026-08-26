"""
Shared type definitions for the climate radar backend.

Single source of truth for classification labels, thresholds,
and common data shapes used across scrapers, classifiers, and API.
"""

from typing import Literal, TypedDict

ClassificationLabel = Literal["favorable", "needs_review", "unfavorable"]

ClassificationLabelWithUnknown = Literal[
    "favorable", "needs_review", "unfavorable", "unknown"
]

FAVORABLE_MAX = 0.30
UNFAVORABLE_MIN = 0.60
NEUTRAL_DEFAULT = 0.45

CONFIDENCE_HIGH_THRESHOLD = 0.30
CONFIDENCE_MEDIUM_THRESHOLD = 0.15


class ComponentsDict(TypedDict, total=False):
    keyword_score: float
    bert_score: float


class ScrapedBill(TypedDict, total=False):
    external_id: str
    source: str
    bill_type: str
    number: int
    year: int
    ementa: str
    status: str
    presentation_date: str | None
    link: str
    theme_ids: str | None
    theme_names: str | None
    author: str | None
    author_party: str | None
    author_state: str | None


class PipelineSummary(TypedDict, total=False):
    camara_fetched: int
    senado_fetched: int
    new_bills: int
    classified: int
    updated: int
