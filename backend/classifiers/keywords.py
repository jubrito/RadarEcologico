"""
Keyword-based classifier for Brazilian climate bills.

Uses the taxonomy from keywords/taxonomy.py to classify each bill's ementa.
Zero AI cost, runs in <1ms on CPU.
"""

import re
from dataclasses import dataclass, field

from backend.keywords.taxonomy import (
    NEGATING_VERBS,
    NEGATIVE_KEYWORDS,
    POSITIVE_KEYWORDS,
    PROHIBITING_VERBS,
    negative_patterns,
    positive_patterns,
)
from backend.types import (
    ClassificationLabel,
    FAVORABLE_MAX,
    NEUTRAL_DEFAULT,
    UNFAVORABLE_MIN,
)


@dataclass
class ClassificationResult:
    score: float
    classification: ClassificationLabel
    evidence: list[str] = field(default_factory=list)
    positive_hits: int = 0
    negative_hits: int = 0
    positive_pattern_matches: int = 0
    negative_pattern_matches: int = 0


def classify_keywords(ementa: str) -> ClassificationResult:
    """
    Classify a bill's ementa using keyword and pattern matching.

    Scoring logic:
      - Positive keywords / patterns push score DOWN (toward 0).
      - Negative keywords / patterns push score UP (toward 1).
      - A signal preceded by a negating verb (e.g. "revoga a proteção
        ambiental") is flipped to the opposite stance, and likewise a
        negative signal preceded by a prohibiting verb (e.g. "proíbe a
        mineração em terra indígena").

    Classification thresholds:
      score < 0.30  → favorable
      0.30 ≤ score < 0.60 → needs_review
      score ≥ 0.60 → unfavorable
    """
    text = ementa.lower()

    pos_hits = 0
    neg_hits = 0
    pos_patterns = 0
    neg_patterns = 0
    positive_evidence: list[str] = []
    negative_evidence: list[str] = []

    for kw in POSITIVE_KEYWORDS:
        idx = text.find(kw)
        if idx < 0:
            continue
        if _is_preceded_by(text, idx, NEGATING_VERBS):
            neg_patterns += 1
            negative_evidence.append(kw)
        else:
            pos_hits += 1
            positive_evidence.append(kw)

    for kw in NEGATIVE_KEYWORDS:
        idx = text.find(kw)
        if idx < 0:
            continue
        if _is_preceded_by(text, idx, PROHIBITING_VERBS):
            pos_patterns += 1
            positive_evidence.append(kw)
        else:
            neg_hits += 1
            negative_evidence.append(kw)

    for pattern in positive_patterns():
        match = re.search(pattern, text, re.IGNORECASE)
        if match is None:
            continue
        if _is_preceded_by(text, match.start(), NEGATING_VERBS):
            neg_patterns += 1
            negative_evidence.append(pattern)
        else:
            pos_patterns += 1
            positive_evidence.append(pattern)

    for pattern in negative_patterns():
        match = re.search(pattern, text, re.IGNORECASE)
        if match is None:
            continue
        if _is_preceded_by(text, match.start(), PROHIBITING_VERBS):
            pos_patterns += 1
            positive_evidence.append(pattern)
        else:
            neg_patterns += 1
            negative_evidence.append(pattern)

    score = _compute_score(pos_hits, neg_hits, pos_patterns, neg_patterns)

    if score >= UNFAVORABLE_MIN:
        classification = "unfavorable"
    elif score < FAVORABLE_MAX:
        classification = "favorable"
    else:
        classification = "needs_review"

    evidence = positive_evidence[:3] + [f"-{e}" for e in negative_evidence[:3]]

    return ClassificationResult(
        score=score,
        classification=classification,
        evidence=evidence,
        positive_hits=pos_hits,
        negative_hits=neg_hits,
        positive_pattern_matches=pos_patterns,
        negative_pattern_matches=neg_patterns,
    )


_NEGATION_WINDOW = 80


def _is_preceded_by(text: str, start: int, verbs: list[str]) -> bool:
    """True when any verb appears shortly before the given position."""
    window = text[max(0, start - _NEGATION_WINDOW):start]
    return _contains_any(window, verbs)


def _contains_any(window: str, verbs: list[str]) -> bool:
    return any(v in window for v in verbs)


def _compute_score(
    pos_hits: int,
    neg_hits: int,
    pos_patterns: int,
    neg_patterns: int,
) -> float:
    """
    Compute a score 0.0–1.0 where higher = more harmful to climate.
    """

    # No climate signals at all — default to neutral center.
    if pos_hits == 0 and neg_hits == 0 and pos_patterns == 0 and neg_patterns == 0:
        return NEUTRAL_DEFAULT

    base_score = 0.35

    # Negative signals raise score
    if neg_patterns > 0:
        base_score += 0.20 + min(0.15, neg_patterns * 0.10)

    if neg_hits >= 3:
        base_score += 0.15
    elif neg_hits >= 1:
        base_score += neg_hits * 0.04

    # Positive signals lower score
    if pos_patterns > 0:
        base_score -= 0.20 + min(0.10, pos_patterns * 0.08)

    if pos_hits >= 3:
        base_score -= 0.15
    elif pos_hits >= 1:
        base_score -= pos_hits * 0.04

    return max(0.0, min(1.0, round(base_score, 3)))
