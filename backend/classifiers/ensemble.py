"""
Ensemble classifier that combines keyword and BERT model scores.

Phase 1 (current): uses only keyword classifier (100% weight).
Phase 2: blends keyword (40%) + BERT (60%) scores.
"""

from dataclasses import dataclass, field

from backend.classifiers.keywords import ClassificationResult, classify_keywords


@dataclass
class EnsembleResult:
    final_score: float
    classification: str  # 'transforming' | 'unfavorable' | 'needs_review'
    confidence: str  # 'high' | 'medium' | 'low'
    components: dict[str, float] = field(default_factory=dict)
    evidence: list[str] = field(default_factory=list)


def classify_ensemble(ementa: str) -> EnsembleResult:
    """
    Classify a bill using the ensemble.

    Phase 1: keyword classifier only.
    Phase 2: keywords (0.4) + BERT (0.6).
    """
    kw_result = classify_keywords(ementa)

    final_score = kw_result.score

    if abs(final_score - 0.5) > 0.30:
        confidence = "high"
    elif abs(final_score - 0.5) > 0.15:
        confidence = "medium"
    else:
        confidence = "low"

    return EnsembleResult(
        final_score=final_score,
        classification=kw_result.classification,
        confidence=confidence,
        components={
            "keyword_score": kw_result.score,
        },
        evidence=kw_result.evidence,
    )


def classify_ensemble_with_bert(
    keyword_score: float,
    bert_score: float,
    keyword_weight: float = 0.40,
    bert_weight: float = 0.60,
) -> tuple[float, str]:
    """
    Blend keyword and BERT scores into a final classification.
    Used in Phase 2 when BERT model is available.
    """
    final_score = keyword_weight * keyword_score + bert_weight * bert_score

    if final_score >= 0.60:
        classification = "unfavorable"
    elif final_score < 0.30:
        classification = "transforming"
    else:
        classification = "needs_review"

    return final_score, classification
