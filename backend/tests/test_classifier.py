"""
Tests for the keyword-based bill classifier.
"""

import pytest

from backend.classifiers.ensemble import classify_ensemble
from backend.classifiers.keywords import ClassificationResult, classify_keywords


# --- Keyword classifier tests ---


def test_strong_favorable_bill():
    """Bill with multiple positive keywords + patterns should be favorable."""
    result = classify_keywords(
        "Institui a Política Nacional de Mudanças Climáticas e cria "
        "o Fundo Nacional de Combate ao Desmatamento e proteção da Amazônia, "
        "promovendo a redução de emissões de gases de efeito estufa."
    )
    assert result.classification == "favorable"
    assert result.score < 0.30
    assert result.positive_hits >= 1


def test_strong_unfavorable_bill():
    """Bill with negative keywords + critical pattern should be unfavorable."""
    result = classify_keywords(
        "Altera a Lei de Licenciamento Ambiental para flexibilizar "
        "licenciamento e dispensa estudo de impacto ambiental para "
        "obras de infraestrutura, reduzindo competência de fiscalização do IBAMA."
    )
    assert result.classification == "unfavorable"
    assert result.score >= 0.60
    assert result.negative_hits >= 1


def test_mining_indigenous_land_is_unfavorable():
    """Mining in indigenous territory is a critical pattern."""
    result = classify_keywords(
        "Autoriza a exploração mineral em terra indígena e mineração "
        "em áreas protegidas para extração de minérios."
    )
    assert result.classification == "unfavorable"
    assert result.score >= 0.60


def test_neutral_bill_is_review():
    """Text with no climate keywords defaults to needs_review."""
    result = classify_keywords(
        "Institui o Dia Nacional da Abobrinha."
    )
    assert result.classification == "needs_review"
    assert 0.30 <= result.score < 0.60


def test_revokes_forest_code_is_unfavorable():
    """Revoking the Forest Code is a critical negative pattern."""
    result = classify_keywords(
        "Revoga o Código Florestal brasileiro e elimina áreas de preservação permanente."
    )
    assert result.classification == "unfavorable"


def test_ambiguous_bill_needs_review():
    """Mixed signals — both positive and negative keywords."""
    result = classify_keywords(
        "Dispõe sobre a proteção ambiental e autoriza a mineração "
        "em unidades de conservação para exploração mineral."
    )
    assert result.classification in ("needs_review", "unfavorable")


def test_evidence_includes_matched_keywords():
    """Evidence field should contain matched keywords."""
    result = classify_keywords(
        "Cria o Fundo Nacional de Combate ao Desmatamento e "
        "estabelece política de pagamento por serviços ambientais na Amazônia."
    )
    assert len(result.evidence) > 0


def test_score_bounds():
    """Score must always be between 0.0 and 1.0."""
    test_cases = [
        "Institui política nacional de mudanças climáticas e cria "
        "mercado de carbono regulado com metas climáticas ambiciosas.",
        "Revoga todas as leis ambientais e extingue o IBAMA.",
        "Proteção da Amazônia mas permite mineração em terra indígena "
        "e autoriza exploração de petróleo.",
    ]
    for text in test_cases:
        result = classify_keywords(text)
        assert 0.0 <= result.score <= 1.0


# --- Parametrized classification tests ---


@pytest.mark.parametrize(
    "ementa, expected_label",
    [
        (
            "Institui a Política Nacional de Mudanças Climáticas e cria "
            "fundo de combate ao desmatamento.",
            "favorable",
        ),
        (
            "Cria programa de pagamento por serviços ambientais para "
            "proteção dos biomas e recuperação florestal.",
            "favorable",
        ),
        (
            "Autoriza mineração em terra indígena e regularização fundiária "
            "na Amazônia.",
            "unfavorable",
        ),
        (
            "Flexibiliza licenciamento ambiental e dispensa EIA RIMA para "
            "obras de infraestrutura.",
            "unfavorable",
        ),
        (
            "Anistia multa ambiental e extingue débito de infrações "
            "contra a flora.",
            "unfavorable",
        ),
        (
            "Institui o Dia do Engenheiro Civil.",
            "needs_review",
        ),
    ],
)
def test_parametrized_classification(ementa: str, expected_label: str):
    """Multiple scenarios covering all three labels."""
    result = classify_keywords(ementa)
    assert result.classification == expected_label, (
        f"Expected {expected_label} but got {result.classification} "
        f"(score={result.score})"
    )


# --- Ensemble tests ---


def test_ensemble_uses_keyword_classifier():
    """In Phase 1, ensemble should use keyword classifier results."""
    result = classify_ensemble(
        "Altera o Código Florestal para flexibilizar reserva legal "
        "e anistia desmatamento."
    )
    assert "keyword_score" in result.components
    assert result.classification == "unfavorable"


def test_ensemble_confidence_levels():
    """Confidence should reflect distance from the 0.5 boundary."""

    strong_fav = classify_ensemble(
        "Institui política nacional de mudanças climáticas e cria "
        "programa de reflorestamento e proteção dos biomas e "
        "combate ao desmatamento."
    )
    assert strong_fav.confidence == "high"

    neutral = classify_ensemble(
        "Institui o Dia do Brigadeiro de Panela."
    )
    assert neutral.confidence in ("low", "medium")


# --- Edge case tests ---


def test_empty_ementa_is_neutral():
    result = classify_keywords("")
    assert result.classification == "needs_review"
    assert 0.30 <= result.score < 0.60
    assert result.positive_hits == 0
    assert result.negative_hits == 0


def test_very_long_ementa():
    long_text = (
        "Institui a Política Nacional de Mudanças Climáticas e cria o "
        "Fundo Nacional de Combate ao Desmatamento e proteção da Amazônia, "
        "promovendo a redução de emissões de gases de efeito estufa e "
        "estabelecendo metas de descarbonização para 2030 e 2050."
    ) * 10
    result = classify_keywords(long_text)
    assert result.classification == "favorable"
    assert result.score < 0.30


def test_mixed_signals_resolves_to_needs_review():
    result = classify_keywords(
        "Institui programa de reflorestamento e recuperação florestal "
        "mas também flexibiliza licenciamento ambiental para obras públicas."
    )
    assert result.classification in ("needs_review", "unfavorable")


def test_critical_negative_patterns():
    cases = [
        "Revoga o Código Florestal e extingue áreas de preservação.",
        "Autoriza mineração em terra indígena e territórios protegidos.",
        "Anistia multa ambiental e extingue débito de infrações contra a flora.",
    ]
    for text in cases:
        result = classify_keywords(text)
        assert result.classification == "unfavorable", (
            f"Expected unfavorable for '{text[:50]}...', got {result.classification}"
        )


def test_positive_patterns_recognized():
    cases = [
        "Institui a Política Estadual de Mudanças Climáticas e cria fundo de compensação.",
        "Cria unidade de conservação de proteção integral no bioma cerrado.",
        "Reconhece o estado de emergência climática no município.",
    ]
    for text in cases:
        result = classify_keywords(text)
        assert result.classification == "favorable", (
            f"Expected favorable for '{text[:50]}...', got {result.classification}"
        )


def test_score_trend():
    stronger_fav = classify_keywords(
        "Institui política nacional de mudanças climáticas e cria "
        "programa de reflorestamento e proteção dos biomas e combate ao desmatamento."
    )
    weaker_fav = classify_keywords("Cria programa de reciclagem municipal.")

    assert stronger_fav.score < weaker_fav.score, (
        "Stronger positive signal should get lower (more favorable) score"
    )


def test_classify_ensemble_with_bert():
    from backend.classifiers.ensemble import classify_ensemble_with_bert

    score, label = classify_ensemble_with_bert(0.2, 0.4)
    assert 0.0 <= score <= 1.0
    assert label in ("favorable", "needs_review", "unfavorable")

    score, label = classify_ensemble_with_bert(0.8, 0.9)
    assert score >= 0.60
    assert label == "unfavorable"
