"""
Keyword-based classifier for Brazilian climate bills.

Uses the taxonomy from keywords/taxonomy.py to classify each bill's ementa.
Zero AI cost, runs in <1ms on CPU.
"""

import re
from dataclasses import dataclass, field

from backend.keywords.taxonomy import (
    NEGATIVE_KEYWORDS,
    NEGATIVE_MODIFIERS,
    POSITIVE_KEYWORDS,
    POSITIVE_MODIFIERS,
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
      - Critical negative patterns (revoke, mining in indigenous land, amnesty)
        give a strong push.

    Classification thresholds:
      score < 0.30  → favorable
      0.30 ≤ score < 0.60 → needs_review
      score ≥ 0.60 → unfavorable
    """
    text = ementa.lower()

    pos_hits = sum(1 for kw in POSITIVE_KEYWORDS if kw in text)
    neg_hits = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text)

    pos_patterns = sum(
        1 for p in positive_patterns() if re.search(p, text, re.IGNORECASE)
    )
    neg_patterns = sum(
        1 for p in negative_patterns() if re.search(p, text, re.IGNORECASE)
    )

    evidence: list[str] = []

    if pos_hits > 0:
        found_pos = [kw for kw in POSITIVE_KEYWORDS if kw in text]
        evidence.extend(found_pos[:3])
    if neg_hits > 0:
        found_neg = [kw for kw in NEGATIVE_KEYWORDS if kw in text]
        evidence.extend(f"-{kw}" for kw in found_neg[:3])

    score = _compute_score(pos_hits, neg_hits, pos_patterns, neg_patterns)

    if score >= UNFAVORABLE_MIN:
        classification = "unfavorable"
    elif score < FAVORABLE_MAX:
        classification = "favorable"
    else:
        classification = "needs_review"

    return ClassificationResult(
        score=score,
        classification=classification,
        evidence=evidence,
        positive_hits=pos_hits,
        negative_hits=neg_hits,
        positive_pattern_matches=pos_patterns,
        negative_pattern_matches=neg_patterns,
    )


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
