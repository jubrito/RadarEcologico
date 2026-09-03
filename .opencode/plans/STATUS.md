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

2026-09-03

## Current phase

**Sprint 5 — Review area (admin) (complete)** — next up: Sprint 6 (PostgreSQL/Supabase consolidation)

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
- [x] Always-on classification phrase on the bill detail page ("Classificação (estimada):", to become "Classificação (revisada)" once the review feature lands): a fixed stance sentence for `favorable` ("Ativamente combate as causas da catástrofe climática…") and `unfavorable` ("Intensifica diretamente as causas da catástrofe climática…"), and a three-way split within `needs_review` (helps superficially / neutral / harms superficially); `neutral` label (grey) reserved for the human-review outcome
- [x] Review pass: fixed phrase grammar/accents, removed dead `scoreToClassification()`, added boundary tests for the `needs_review` sub-label

## Sprint 1 — Infrastructure & data (complete)

- [x] Simplify the bill details page (single responsibility, extract components)
- [x] Tests for all changes
- [x] GitHub link + icon in the nav
- [x] Extract reusable types/constants (labels, colors, strings)
- [x] Remove unnecessary comments
- [x] Review AGENTS.md against current code

## Sprint 2 — Bill details (complete)

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

## Sprint 3 - Deploy

- [x] Deploy do projeto na plataforma do github para que seja acessivel lá (sem pagar nada). Documentar processo pra rodar e atualizar a pagina. Atualizar o github repo.
  - Static export (`frontend/next.config.ts`: `output: "export"` + `basePath`/`assetPrefix` configuráveis via `NEXT_PUBLIC_BASE_PATH`).
  - `backend/export_static.py` exports the DB → `frontend/public/data/{bills,stats,tramitacoes,votacoes}.json`, pre-fetching tramitação/votações (thread pool, batched).
  - `frontend/src/lib/api.ts` reads static JSON + client-side filter/search/sort/pagination (mirrors `GET /api/bills`); bill detail split into server page (`generateStaticParams`) + client `bill-detail.tsx`.
  - `.github/workflows/deploy.yml`: GitHub Pages deploy (manual + daily cron + push). Push builds committed data (no re-scrape); schedule/manual refreshes data first.
  - README documents the process. Next step (Sprint 6) consolidates the Supabase DB with this static pipeline.

## Sprint 4 – Login/Auth (enable admin page)

For the next sprint review admin page, we need to add support to login, authentication, etc. Focus on a safe solution (following security best practices like having safe passwords and storing them safely in the db), but in the way that would cost me the most (is there a free way?). Do everything necessary for us to be able to have an admin area where the user can log in.

## Sprint 5 — Review area (admin)

Human-review interface via Supabase Auth + `bill_reviews` table:

- [x] `/admin` route: login/register (Supabase Auth, per-user accounts) + list of `needs_review` bills
- [x] Review form: 0–100 slider (derives `favorable`/`needs_review`/`unfavorable` via the same thresholds as the detail page) + "não se relaciona" toggle → `neutral` + notes
- [x] Reviews upserted to Supabase `bill_reviews` (keyed by `(source, external_id)`, RLS: authenticated only)
- [x] `export_static.py` merges reviews into `bills.json` (service-role key); stats include `reviewed`
- [x] Public display: "Classificação (revisada)" on detail, "revisada" on bill cards, reviewed-count on the dashboard
- [x] No custom backend needed — static site writes to Supabase directly; reviews ride the existing deploy pipeline

Setup (one-time): run `supabase/schema.sql` in the Supabase SQL editor; set `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (repo variables) + `SUPABASE_URL`/`SUPABASE_SECRET_KEY` (secrets) — using Supabase's own key names.

## Sprint 7 – Labels and architecture improvements

## Sprint 8 – Admin improvements

### Refactored admin page

### Other improvements

- [ ] Add "Update your password" feature
- [ ] Handle form accessibility
- [ ] Handle form errors (user already exist, minimum security requirement password, etc)
- [ ] When you're logged-in:
  - [ ] Instead of calling the nav "Revisão", it should only be "Log in" if you're logged out (seeing the log in form) and "Log out" if you're logged in (it should be in the right side, like the github icon)
  - Instead of having the "revision tab" (which is not scalable, as to see/filter bills we'd have to replicate the features to this tabs instead of taking advantage of the existing tables/lists), I want to edit the existing pages (bills list, bills details page) so we can use the existing data but, if we're logged in, we can click on a pencil and see features in the screens that allow us to do stuff. Examples to inspire you:
    - [ ] we should use the same "Projetos de lei" tab, but we should show an icon with a pencil on the top-right side of the bill card (on the right of the labels, e.g "requer revisão humana")
    - [ ] when we open the bill details page, we should se an "edit <pencil_icon>" button right on the right side of the "Ver fonte original", when clicking on it, we should see the colored border of the top of the bill details page (e.g the orange one) expand slowly in an animated way, inside of this expanded colored section, we should show a "Revisão atual" title and below it show the "Notas" field like you added in the current "Revisão" section. We should say: "(i) Classifique esse projeto de lei utilizando a barra de progresso abaixo" text
- [ ] Add tests

## Sprint 9 - Error notification

- [x] Create notification toaster component to be reused across the repo
- [x] Add tests
- [x] Use the component on places where we should show a notification to the user to improve UX (communicating to the user on a user frientdly language what the user must know)

## Sprint 10 — Infrastructure (PostgreSQL)

- [ ] Review the steps below to se if we're doing everything correctly or if we should improve something

1. Create Supabase project (free tier)
2. Get `DATABASE_URL`
3. Set it in `.env`
4. Tables auto-created via `Base.metadata.create_all`
5. Run the pipeline to populate

### Code review notes (2026-09-03) — findings

The steps are essentially right, but there are 4 real gaps to fix while working this sprint:

1. **Pipeline never creates tables (main gap).** `create_tables()` is only called on FastAPI startup (`backend/main.py:26`). `python -m backend.pipeline` only imports engine/session, so on a fresh Supabase the first query fails with `relation "bills" does not exist`. Fix: call `create_tables()` at the top of `run_pipeline()` (or run `python -c "from backend.database import create_tables; create_tables()"` before step 5).

2. **Use the Session pooler (port 5432) connection string** from the Supabase dashboard (works with psycopg2/SQLAlchemy's default `postgresql://` dialect). Keep the URL-encoded password as-is. `pool_size=5, max_overflow=0, pool_pre_ping=True` is fine.

3. **The GitHub Actions cron still uses SQLite**, so Supabase stays empty unless the pipeline is run manually. In `.github/workflows/deploy.yml:30` the refresh job sets `DATABASE_URL: sqlite:///./radar.db`. Change it to `DATABASE_URL: ${{ secrets.DATABASE_URL }}` and add that GitHub secret.

4. **Model nits for Postgres:**
   - `BillSnapshot.snapshot_date` uses `server_default=func.current_date()` on a DateTime column → PG stores midnight (`date` → `timestamp` implicit cast). Use `func.current_timestamp()`/`func.now()` (the Python default returns `.date()`, not a datetime).
   - `bill_snapshots.bill_id` has no ForeignKey — add one for prod integrity.

### Other considerations

- `create_all` won't alter tables later — migration trap on a persistent DB. Configure Alembic before the next schema change.
- Add `connect_args={"connect_timeout": 10}` to the engine so the cron fails fast instead of hanging on a paused free-tier project.
- After populating, run the pipeline twice to confirm `UniqueConstraint` idempotency holds on PG.

## Sprint 11 — Party dashboard

- [ ] Show parties and compare how each votes
- [ ] Analyses to extract the data

## Sprint 12 — AI improvements

- [ ] **Word-boundary matching**: `kw in text` is substring matching and can false-positive on short terms (a keyword matching inside a longer word). Switch to word-boundary/tokenized matching.
- [ ] **Score calibration**: the scoring constants (`base_score = 0.35`, per-pattern `+0.20`, per-keyword `±0.04`, etc.) are hand-tuned guesses. Validate and tune them against labeled data (see "Calibration plan" below).
- [ ] **Pre-filter misses pattern-only bills**: `ementa_matches_climate()` only checks keywords, not regex patterns, so bills that match a pattern but contain no keyword are dropped at scrape time. Make the pre-filter pattern-aware or accept the conservative filter.
- [ ] **Classification summary**: a short phrase (3–5 words) explaining why a bill got its classification, based on the matched keywords/patterns.

## Sprint 9 — Collaborative review (public voting)

1. Vote per bill (agree/disagree with the classification)
2. Vote counters per category (e.g. "12 favorable, 3 unfavorable, 5 review")
3. `POST /api/bills/{id}/vote` → `{"vote": "favorable"|"unfavorable"|"needs_review"}`
4. `BillVote` model: `bill_id`, `vote`, `voted_at`, `fingerprint` (IP+user-agent hash)
5. Anti-duplication: one vote per fingerprint per bill
6. UI with 3 vote buttons + proportion bars

## Sprint 13 - Calibration plan (AI)

- **When**: Sprint 6 (or sooner, once `data/` has labeled bills).
- **Why**: the scoring constants are unvalidated guesses; without a labeled eval we can't measure precision/recall or tune the thresholds.
- **How**:
  1. Load labeled CSVs into `data/` (`external_id, source, ementa, manual_classification`).
  2. Run `classify_keywords()` over each labeled ementa and compare to `manual_classification`.
  3. Build a confusion matrix and precision/recall/F1 per label.
  4. Sweep the scoring constants (base score, per-pattern/per-keyword weights) and the thresholds (`FAVORABLE_MAX`, `UNFAVORABLE_MIN`) to maximize F1.
  5. Add a repeatable script (`backend/scripts/evaluate.py`) or a notebook.

## Sprint 15 — Taxonomy + inline review (in progress)

Replace the `/admin` review dashboard with inline review on the existing bills pages, and split the
classification into a reviewer-derived fine taxonomy. Iterative; each step = one cohesive commit with
tests.

### Taxonomy (score is the single source of truth)

- `reviewer_score` (0–100) + `not_related` checkbox are the only stored review inputs. Everything else
  (stance, coarse label, phrase, colors) is **derived at render** by `deriveStance(score, notRelated)`.
- `reviewer_classification` is still written as a coarse roll-up (favorable/neutral/unfavorable) for
  backward-compat with the static export — the frontend never reads it for display.
- **Fine stances (reviewed, even 20-pt bands):**
  | Score | Stance | Phrase | Color |
  |---|---|---|---|
  | 0–19 | Combate a crise | Ativamente combate as causas da catástrofe climática… | deep emerald |
  | 20–39 | Ajuda a luta | Ajuda de alguma forma (mesmo que não significativamente)… | soft green/teal |
  | 40–59 | Nem ajuda nem atrapalha | Nem ajuda nem atrapalha significativamente… | amber |
  | 60–79 | Atrapalha a luta | Atrapalha de alguma forma (mesmo que não significativamente)… | orange |
  | 80–100 | Intensifica a crise | Intensifica diretamente as causas da catástrofe climática… | deep red |
  | (checkbox) | Sem relação climática | Não se relaciona com questões climáticas. | slate |
- **Coarse (unreviewed / machine):** `<35` favorable · `35–65` requer revisão · `>65` unfavorable
  (thresholds changed from 30/60 → 35/65 to center the uncertainty band). The AI stays coarse; the
  machine label never becomes a fine stance. **Reviewed bills never show `needs_review`** — the review
  middle band (40–59) rolls up to `neutral`.
- **Dropdown groups (selectable at both levels):** Favoráveis à luta climática [Combate a crise ·
  Ajuda a luta] · Ambivalentes [Nem ajuda nem atrapalha · Sem relação climática] · Desfavoráveis à luta
  climática [Atrapalha a luta · Intensifica a crise] · Requer revisão humana · Neutro.
  - Colors vary by gravity (deep vs soft emerald, orange vs red) so intensity is visible at a glance.

### Steps

- [ ] **1. Taxonomy core (frontend lib):** `deriveStance(score, notRelated)` + `STANCE_MAP`
      (per-stance `ClassificationStyle`), band constants, `classifyFromReviewScore` → never
      `needs_review`, `getClassificationPhrase` aligned to the fine bands, `filterBills` stance/group
      filters, tests.
- [ ] **2. Backend thresholds:** `FAVORABLE_MAX` 0.30 → 0.35, `UNFAVORABLE_MIN` 0.60 → 0.65
      (`backend/types.py`, mirror in `frontend/src/lib/types.ts` + `reviews.ts`), update keyword/route
      tests.
- [ ] **3. Grouped dropdown:** replace the flat classification `Select` in `bills-content.tsx` with a
      selectable group + subitem control (Favoráveis/Ambivalentes/Desfavoráveis/Requer revisão/Neutro);
      `filterBills` understands group + stance values; tests.
- [ ] **4. Shared auth:** `SessionProvider` + `useSession` (`src/lib/session.tsx`), wrapped in
      `layout.tsx`; handles Supabase-not-configured (→ logged out); tests.
- [ ] **5. Nav:** remove "Revisão"; add `Entrar` (→ `/login`) / `Sair` on the right, before the GitHub
      icon; tests.
- [ ] **6. Login page:** move `LoginForm` from `/admin` to new `/login` (`emailRedirectTo` → `/login`);
      delete `/admin` + dashboard tests; re-home login/register tests; tests.
- [ ] **7. Bill card:** pencil (`aria-label="Revisar projeto"`, → `/bills/[id]?edit=1`, logged-in only)
      top-right + `BadgeCheck` "Revisada" indicator + stance badge/color by gravity; tests.
- [ ] **8. Bill detail:** pencil next to "Ver fonte original"; animated expanding colored section
      (grid-rows expand) with "Revisão atual", helper "(i) Classifique esse projeto de lei utilizando a
      barra de progresso abaixo", **editable slider** (live % / phrase / page colors via
      `deriveStance`), `Notas`, `Salvar revisão`, "Revisado por {email} em {date}"; `?edit=1`
      auto-opens (Suspense-wrapped for `useSearchParams`); muted-text policy (non-editable headings →
      `text-muted-foreground`, ementa + risk block stay foreground); tests.
- [ ] **9. Prototype mock page (carousel):** render bill-detail mock with each edit-mode option so the
      look can be chosen before finalizing; simulated save.
- [ ] **10. Reviewed indicators (bonus):** consistent emerald check iconography on card + detail;
      "Revisado por {email} em {date}".

## Sprint 14 - Improvements

- [ ] Improve accessibility scores
- [ ] Review "neutral" logic and the sublabels on bill details pages to ensure that reviewers can categorize bills as neutral while seeing the three types of sublabels on the % block

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
