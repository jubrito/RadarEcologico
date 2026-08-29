# AGENTS.md — Ecological Legislative Radar

> Instructions for AI agents (OpenCode, Cursor, Copilot, etc.).
> Read before making any changes. Additional context in `.opencode/plans/`.

---

## Mission

Automatically classify Brazilian Bills related to the climate crisis:

| Label          | Score       | Meaning                                     |
| -------------- | ----------- | ------------------------------------------- |
| `favorable`    | < 0.30      | Potentially helps combat the climate crisis |
| `needs_review` | 0.30 - 0.60 | Requires human review                       |
| `unfavorable`  | ≥ 0.60      | Potentially intensifies the climate crisis  |
| `neutral`      | (no signal) | Not related to climate issues               |

**Attention:** the code and the API use `favorable`. If you generate code with the label `transforming`, it will be wrong.

Scope: Brazil. Current sources: Chamber of Deputies and Federal Senate APIs.

---

## Principles (always follow, no exceptions)

### 1. Green Software First (non-negotiable)

- **Green software principles**: Always prioritize following green software principles (carbon efficiency, energy efficiency, carbon awareness, hardware efficiency).
- **Efficient AI**: minimize token usage, be objective in responses, use tokens strategically to spend less energy/time.
- Batch > real-time: pipeline runs 1x/day via cron, not on every request.
- Use Chamber API pre-filters (`codTema=<climate theme codes>`) to reduce requests by ~90%.
- Single process: the Python FastAPI backend serves API, classification, and scraping.
- Dark mode as default (saves energy on OLED).
- ISR in Next.js: revalidate pages only when data changes.
- Quantized models (int8 BERT, phase 2).
- GitHub Actions cron at 2 AM BRT (5 AM UTC, off-peak).
- **Ask yourself before every decision**: "does this consume less or more energy?" Focus on consuming less.

### 2. Simplicity (KISS)

- If an `if` solves it, don't use design patterns.
- No premature abstraction. No Celery, Redis, RabbitMQ.
- FastAPI + SQLAlchemy are sufficient.
- TypeScript `strict: true`, no unnecessarily complex generics.

### 3. Testability

- **Changes must update tests**: When making a change or adding a feature, don't forger to update the existing tests or create new ones
- **Every classification function must have tests** (keyword classifier, ensemble, BERT wrapper).
- **Every scraper must have tests** with mocks of external APIs (pytest + httpx).
- **Every API route must have tests** (FastAPI TestClient + pytest-asyncio).
- **Frontend**: tests with vitest + testing-library (configured; query by role/label).
- Desired coverage: 80%. Doesn't block PR, but write tests for new features.
- Use `pytest.mark.parametrize` to test multiple bill-summary variations.

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
- **PostgreSQL indexes**: create indexes for columns used in filters and sorting (`classification`, `year`, `source`, `final_score`).
- **Idempotency in scrapers**: running the pipeline twice in a row must not duplicate data. Enforced by `UniqueConstraint(source, external_id)` plus an existence check in the pipeline.
- **Connection pooling**: use the SQLAlchemy pool (default 5 connections, sufficient)

### 6. Maintainability

- Type hints in all Python. TypeScript without `any` (except external API wrappers).
- Clear names: `classify_bill_keywords()`, not `process()` or `handle()`. If the code isn't clear, extract constants/variables/functions with meaningful names.
- No commented-out code — delete it, git keeps history.
- Docstrings on public functions (what it does, parameters, return).
- Updated README: whenever you add a new feature, check that the README is still correct.
- In the frontend, prefer camelCase; in the backend, prefer snake_case.
- Functions, constants, and variables must have meaningful names.

---

## Stack (actual installed versions)

| Layer    | Technology                                                                  |
| -------- | --------------------------------------------------------------------------- |
| Backend  | Python 3.12+, FastAPI                                                       |
| AI       | Keyword classifier (phase 1). BERTimbau (phase 2)                           |
| Database | SQLite (local dev). PostgreSQL/Supabase (prod)                              |
| ORM      | SQLAlchemy 2.0 (no Alembic — tables created via `Base.metadata.create_all`) |
| Frontend | Next.js **16**, React 19, Turbopack                                         |
| CSS      | Tailwind **v4** (CSS-first, no `tailwind.config.ts`)                        |
| UI       | shadcn/ui **v4** (style "base-nova", `@base-ui/react`, **not** Radix)       |
| Pipeline | GitHub Actions cron, manual workflow_dispatch                               |

---

## Gotchas (agents frequently get these wrong)

1. **`shadcn/ui v4 uses @base-ui/react`, NOT Radix UI.**
   - Button: use `render={<Link />}` instead of `asChild`.
   - Badge, Select, Input also have different APIs from Radix.

2. **Tailwind v4 is CSS-first.** Theming is in `globals.css` with `@theme {}`. There is no `tailwind.config.ts`.

3. **ESLint v9 flat config** (`eslint.config.mjs`), not `.eslintrc.*`.

4. **Tables are created automatically** on startup (`Base.metadata.create_all`). There are no Alembic migrations. If you need migrations, configure Alembic first.

5. **There is no Makefile.** The `make dev`/`make test` commands do not work. Use the commands below.

6. **`.env` goes in `backend/`**, not the root.

---

## Commands

```bash
# Backend — always activate the venv first (from the project root)
source backend/.venv/bin/activate
uvicorn backend.main:app --reload          # API at http://localhost:8000
pytest backend/tests -v                    # Tests (129 passing)
python -m backend.pipeline                 # Manual pipeline (classifies + populates database)

# Frontend
cd frontend
npm run dev                                # http://localhost:3000
npm run build && npm start                 # Production
npm run lint                               # ESLint
npm test                                   # Vitest (190 passing)

# Local database (SQLite — zero setup)
# Just configure backend/.env with: DATABASE_URL=sqlite:///./radar.db
# The radar.db file is created at the root automatically on first startup.

# CI
# Tests run on every push/PR (`.github/workflows/ci.yml`).
# Deploy runs daily at 2 AM BRT + on push (`.github/workflows/deploy.yml`). Test manually:
# gh workflow run "Deploy to GitHub Pages"
```

---

## Structure (files that actually exist)

```
radar-ecologico/
├── AGENTS.md
├── README.md
├── .opencode/plans/              # Session context for AI
├── backend/
│   ├── main.py                   # FastAPI entrypoint
│   ├── api/routes.py             # GET /api/bills, /api/stats, POST /api/classify
│   ├── classifiers/
│   │   ├── keywords.py           # Keyword-based classifier
│   │   └── ensemble.py           # Ensemble (phase 1: 100% keyword)
│   ├── keywords/taxonomy.py      # Climate terms taxonomy
│   ├── scrapers/
│   │   ├── camara.py             # Chamber of Deputies
│   │   └── senado.py             # Federal Senate
│   ├── database.py               # SQLAlchemy engine + session
│   ├── models.py                 # ORM: Bill, BillSnapshot
│   ├── pipeline.py               # Daily orchestrator
│   ├── export_static.py          # Exports DB → frontend/public/data/*.json
│   ├── types.py                  # Shared Pydantic types (ScrapedBill, etc.)
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── tests/
│       ├── test_api.py           # 35 tests (routes, filters, stats)
│       ├── test_classifier.py    # 44 tests (parametrized)
│       ├── test_pipeline.py      # 5 tests (backfill/idempotency)
│       ├── test_scrapers.py      # 37 tests (keyword + status extraction)
│       └── test_export_static.py # 4 tests (JSON export)
├── frontend/
│   ├── public/data/              # Generated JSON consumed by the static site
│   ├── src/app/                  # Next.js App Router
│   │   ├── page.tsx              # Dashboard (stats + recent bills)
│   │   └── bills/                # List + detail [id]
│   ├── src/components/           # BillCard, ClassificationBadge, StatCard, Header, MainNav, ui/
│   ├── src/components/bill-metadata/    # Author/party/state/date metadata
│   ├── src/components/status-callout/   # Tramitação status explanation
│   ├── src/lib/api.ts            # Static data layer (reads public/data/*.json + client-side filters)
│   ├── src/lib/types.ts          # Classification types, source labels, query params
│   ├── src/lib/content.ts        # Site copy + state names
│   ├── src/lib/style.ts          # Per-classification Tailwind styles + labels
│   ├── src/lib/themes.ts         # Climate theme code → name map (mirrors backend)
│   ├── src/lib/status.ts         # Bill status → phase/explanation
│   ├── src/lib/bill-helpers.ts   # Author parsing
│   ├── src/lib/utils/            # utils.ts (formatting), classifications.ts (labels)
│   ├── src/lib/hooks/use-bill.ts # Fetch single bill hook
│   ├── components.json           # shadcn/ui v4 config (base-nova)
│   ├── eslint.config.mjs         # ESLint v9 flat config
│   ├── vitest.config.mts         # Vitest config (@ alias)
│   └── next.config.ts
├── data/                         # Labeled bills (CSV) — still empty
├── notebooks/                    # BERT fine-tuning (phase 2) — still empty
└── .github/workflows/
    ├── ci.yml                     # Tests (backend + frontend) on push/PR
    └── deploy.yml                 # GitHub Pages deploy: cron 2 AM BRT + push + manual
```

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

---

## Pipeline

The current ensemble (phase 1) uses 100% keyword classifier. Phase 2 will add BERTimbau with weights: keyword 0.40 + BERT 0.60.

Pipeline order: scrape APIs → filter by climate keywords → deduplicate against DB (`UniqueConstraint(source, external_id)` + existence check) → classify → save.
