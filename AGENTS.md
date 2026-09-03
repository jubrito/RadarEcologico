# AGENTS.md — Ecological Legislative Radar

> Instructions for AI agents (OpenCode, Cursor, Copilot, etc.).

---

## Mission

Automatically classify Brazilian Bills related to the climate crisis:

---

## Principles (always follow, no exceptions)

### 1. Green Software First (non-negotiable)

- **Green software principles**: Always prioritize following green software principles (carbon efficiency, energy efficiency, carbon awareness, hardware efficiency).
- **Efficient AI**: minimize token usage, be objective in responses, use tokens strategically to spend less energy/time.
- Dark mode as default (saves energy on OLED).
- **Ask yourself before every decision**: "does this consume less or more energy than necessary?" Focus on consuming less.
- Try to improve performance by adhering to green software principles

### 2. Good practices

- Always focus on simplicity over complexity
- Robust code over complex code
- KISS
- DRY
- SOLID
- Maintainability and reusability (try to create reusable code to make the code less fragile)

### 3. Testability

- **Changes must update tests**: When making a change or adding a feature, don't forger to update the existing tests or create new ones

### 4. Accessibility (WCAG 2.1 AA)

- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`, not generic `<div>`.
- Labels on every input: `<label htmlFor>` or `aria-label`. Search inputs must be in a `<form>`.
- Skip-to-content link, keyboard navigation, `aria-live` for dynamic updates.
- Contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text).
- Charts must have an alternative table/text. Don't rely solely on color.
- **Do not use `data-testid`** — find elements by accessible roles/labels.
- Test with VoiceOver (macOS) before deploy.

### 5. Scalability (from day 1)

- **Pagination on every list**: never return more than 100 items without pagination.

### 6. Maintainability

- Type hints in all Python. TypeScript without `any` (except external API wrappers).
- Clear names: `classify_bill_keywords()`, not `process()` or `handle()`. If the code isn't clear, extract constants/variables/functions with meaningful names.
- No commented-out code — delete it, git keeps history.
- Docstrings on public functions (what it does, parameters, return).
- Updated README: whenever you add a new feature, check that the README and other doc files are still correct.
- In the frontend, prefer camelCase; in the backend, prefer snake_case.
- Functions, constants, and variables must have meaningful names; extract them when necessary as a way to document the code without having to add more comments

---

## Data Sources

### APIs (phase 1 — federal)

- **Chamber**: `https://dadosabertos.camara.leg.br/api/v2/proposicoes`
  - Filters: `siglaTipo=PL|PLP|PEC|MPV`, `ano`, `codTema=40|41|44|48|51|54|55|56|61|62|64|66|68|70|76`
  - Full list: `https://dadosabertos.camara.leg.br/api/v2/referencias/proposicoes/codTema`
- **Senate**: `https://legis.senado.leg.br/dadosabertos/processo`
  - List by year: `/processo?ano=YYYY`; detail: `/processo/{idProcesso}` (returns `classificacoes`, `documento.autoria`, `situacaoAtual`, `tramitando`).
  - The old `/materia/*` endpoints (list, detail, classes) were deprecated (deactivation 2026-02-01) and replaced by `/processo/*`. Do NOT use `/materia/*`.
  - Senado "Classificação Temática Unificada" is a hierarchical tree (10 top-level categories). We map its climate-relevant leaf classes to the canonical theme ids (`THEME_NAMES`) via `SENADO_CLASS_TO_THEME` in `backend/scrapers/senado.py`.

### Labeled Data (training/validation)

- Climate Observatory: "Destruction Package" (~70 bills)
- CIPÓ Platform: Socio-environmental Legislative Radar
- Format: CSV (`external_id, source, ementa, manual_classification`)
