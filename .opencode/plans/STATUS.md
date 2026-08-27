# Ecological Legislative Radar — Project Status

- Keep this file in English (except code identifiers like variables/constants/functions).
- Go through the items iteratively; avoid too many unrelated things at once so commits stay cohesive.

## Princípios do projeto

- **Green software**: dark mode padrão, batch processing (não real-time), single process, modelos quantizados
- **Acessibilidade WCAG 2.1 AA**: semântica HTML, navegação por teclado, contraste, labels, screen readers
- **KISS**: sem abstração prematura, sem patterns desnecessários, código direto
- **Testabilidade**: testes para classificador, scrapers e rotas (pytest + vitest)
- **Good practices**: clean code, scalability, maintainability, simplicity over complexity, clearity, extracting variables/constants/functions with meaningful names to avoid comments or unintuitive big blocks of code
- **Open Source**: always prioritize open-source projects/tools/technologies projetos
- **Security**: security must be a priority

## Last updated

2026-08-26

## Current phase

**Sprint 2 — Bill details (in progress)**

## Done

- [x] Sprint 0: backend, frontend, CI/CD, tests, docs
- [x] Pipeline running: scrape Câmara + Senado → classify → save
- [x] `THEME_NAMES` with 15 canonical climate themes verified against the API
- [x] Câmara `codTema` pre-filter (cuts requests ~90%)
- [x] Theme filter on the frontend (dropdown next to Classification and Source)
- [x] `Bill` model with `theme_ids` and `theme_names`
- [x] Senado date fix (string → datetime)
- [x] `presentation_date` serialized as ISO 8601
- [x] Classification bar UX (labels + contextual explanation)
- [x] `favorable` label everywhere (not `transforming`)
- [x] Valence detection in the classifier: `NEGATING_VERBS` ("revoga a proteção ambiental" → unfavorable) and `PROHIBITING_VERBS` ("proíbe a mineração" → favorable)
- [x] Split positive keywords into `FIGHTING_KEYWORDS` (strong: protection, restoration, renewables, just transition) vs `MARKET_KEYWORDS` (weak/greenwashing-prone: carbon credits, green hydrogen, "low-carbon" labels) — market terms alone land in `needs_review`, not `favorable`
- [x] Tramitação timeline on the bill detail page: `GET /api/bills/{id}/tramitacoes` (Câmara `/tramitacoes`, Senado `/processo` "informes legislativos") + `Timeline` component
- [x] Party filter on the bills dashboard: `party` param on `GET /api/bills`, `by_party` in `/stats`; Senado now parses `author_party`/`author_state` from the autoria string (both sources filterable)
- [x] Votações on the bill detail page: `GET /api/bills/{id}/votacoes` (Câmara `/votacoes` + `/orientacoes`) + `Votacoes` component with per-party orientations
- [x] Themes page (`/temas`, linked in the nav): every theme with a climate-relevant description
- [x] Removed `Bill.full_text` (dead field, never populated) — reintroduce with clear semantics when a consumer exists (Sprint 3 / phase 2 BERT)
- [x] Cleanup: unused deps (alembic, pydantic-settings, duplicate httpx), dead code (`POSITIVE_MODIFIERS`/`NEGATIVE_MODIFIERS`), stale docstrings
- [x] Centralized classification/source/theme labels (single source of truth)
- [x] Migrated Senado scraper to the `/processo` API (the `/materia/*` endpoints were deprecated); maps Senado `Classificações Temáticas` to Câmara themes via `SENADO_CLASS_TO_THEME`
- [x] Canonical theme taxonomy (`THEME_NAMES` shared by Câmara + Senado): merged `Direito Constitucional` (68) into `Direito e Justiça` (76); split `Povos Indígenas e Comunidades Tradicionais` out of `Direitos Humanos e Minorias` (renamed to `Direitos Humanos`), detected via ementa keywords
- [x] Broadened climate keywords: indigenous/traditional terms (`is_comunidade_tradicional`), green-transition terms (`transição justa`, `hidrogênio verde`, `economia de baixo carbono`, …) and neutral climate topics (`CLIMATE_SIGNAL_KEYWORDS`: fossil fuels, `petróleo`, `gás natural`, `carvão`, `fracking`, `efeito estufa`, `seca`, `enchentes`, `desastres naturais`, `nível do mar`, `grandes fortunas`) so the pre-filter catches them

## Sprint 1 — Infrastructure & data (complete)

- [x] Simplify the bill details page (single responsibility, extract components)
- [x] Tests for all changes
- [x] GitHub link + icon in the nav
- [x] Extract reusable types/constants (labels, colors, strings)
- [x] Remove unnecessary comments
- [x] Review AGENTS.md against current code

## Sprint 2 — Bill details (in progress)

- [x] Author + party + UF in the metadata
- [x] Filter counts: `Name (N)` in the classification/source/theme dropdowns
- [x] Theme multiselect (selecting any theme clears "All themes", clearing all restores it)
- [x] Review/update the frontend types
- [x] Centralize repeated labels (classification/source/theme)
- [x] Show the theme on each `BillCard` (from `theme_ids` → `THEME_MAP`)
- [x] Important milestones: timeline of tramitação events (e.g. "Apresentada em 12/05/2026", "Aprovada na Comissão…", "Aguardando votação no Plenário")
- [x] Add filter by party to the bills dashboard
- [x] Voting: if a vote happened (committee/plenary), show a per-party tally (for/against). Data from the Câmara Votações API.
- [x] Code review
- [x] Themes page: a page listing every theme with its name, a short climate-relevant description, and links to the source taxonomies (Câmara `codTema` reference / Senado "Classificação Temática Unificada" tree)

## Sprint 3 — Review area (admin)

Create the human-review interface:

1. List of `needs_review` bills
2. Review form: confirm/change classification, i.e `favorable` / `unfavorable` / `needs_review` / `unrelated` (needs to be removed since it's not related to the climate emergency themes)
3. Notes field
4. Simple auth (shared password or magic link — no complex OAuth, but need to be a safe auth)
5. `PATCH /api/bills/{id}/review` → `reviewer_classification`, `reviewer_notes`, `reviewed_by`, `reviewed_at`
6. New `Bill` fields: `reviewer_classification`, `reviewer_notes`, `reviewed_by`, `reviewed_at`
7. Add a label that indicates how many were reviewed by a human (in the summary of the main page, in each bill card and in the bill details page)

## Sprint 4 — Infrastructure (PostgreSQL)

1. Create Supabase project (free tier)
2. Get `DATABASE_URL`
3. Set it in `.env`
4. Tables auto-created via `Base.metadata.create_all`
5. Run the pipeline to populate

## Sprint 5 — Party dashboard

- [ ] Show parties and compare how each votes
- [ ] Analyses to extract the data

## Sprint 6 — AI improvements

- [ ] **Word-boundary matching**: `kw in text` is substring matching and can false-positive on short terms (a keyword matching inside a longer word). Switch to word-boundary/tokenized matching.
- [ ] **Score calibration**: the scoring constants (`base_score = 0.35`, per-pattern `+0.20`, per-keyword `±0.04`, etc.) are hand-tuned guesses. Validate and tune them against labeled data (see "Calibration plan" below).
- [ ] **Pre-filter misses pattern-only bills**: `ementa_matches_climate()` only checks keywords, not regex patterns, so bills that match a pattern but contain no keyword are dropped at scrape time. Make the pre-filter pattern-aware or accept the conservative filter.
- [ ] **Classification summary**: a short phrase (3–5 words) explaining why a bill got its classification, based on the matched keywords/patterns.

## Sprint 7 — Collaborative review (public voting)

1. Vote per bill (agree/disagree with the classification)
2. Vote counters per category (e.g. "12 favorable, 3 unfavorable, 5 review")
3. `POST /api/bills/{id}/vote` → `{"vote": "favorable"|"unfavorable"|"needs_review"}`
4. `BillVote` model: `bill_id`, `vote`, `voted_at`, `fingerprint` (IP+user-agent hash)
5. Anti-duplication: one vote per fingerprint per bill
6. UI with 3 vote buttons + proportion bars

## Calibration plan (AI)

- **When**: Sprint 6 (or sooner, once `data/` has labeled bills).
- **Why**: the scoring constants are unvalidated guesses; without a labeled eval we can't measure precision/recall or tune the thresholds.
- **How**:
  1. Load labeled CSVs into `data/` (`external_id, source, ementa, manual_classification`).
  2. Run `classify_keywords()` over each labeled ementa and compare to `manual_classification`.
  3. Build a confusion matrix and precision/recall/F1 per label.
  4. Sweep the scoring constants (base score, per-pattern/per-keyword weights) and the thresholds (`FAVORABLE_MAX`, `UNFAVORABLE_MIN`) to maximize F1.
  5. Add a repeatable script (`backend/scripts/evaluate.py`) or a notebook.

## Blockers

None.

## Quick commands

```bash
# Backend (from the project root)
source backend/.venv/bin/activate
uvicorn backend.main:app --reload         # API at http://localhost:8000
pytest backend/tests -v                   # Tests
python -m backend.pipeline                # Manual pipeline

# Frontend
cd frontend && npm run dev                # http://localhost:3000
cd frontend && npm run lint               # ESLint
cd frontend && npm test                   # Vitest
```
