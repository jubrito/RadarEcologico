# AGENTS.md — Radar Legislativo Ecológico

> Instruções para agentes de IA (OpenCode, Cursor, Copilot, etc.).
> Leia antes de qualquer alteração. Contexto adicional em `.opencode/plans/`.

---

## Missão

Classificar automaticamente Projetos de Lei brasileiros relacionados à crise climática:

| Label          | Score       | Significado                                       |
| -------------- | ----------- | ------------------------------------------------- |
| `favorable`    | < 0.30      | Potencialmente ajuda a combater a crise climática |
| `needs_review` | 0.30 - 0.60 | Requer análise humana                             |
| `unfavorable`  | ≥ 0.60      | Potencialmente intensifica a crise climática      |

**Atenção:** o código e a API usam `favorable`. Se você gerar código com o label `transforming`, ele estará errado.

Âmbito: Brasil. Fontes atuais: APIs da Câmara dos Deputados e Senado Federal.

---

## Princípios (siga sempre, sem exceção)

### 1. Green Software First (não negociável)

- **Principios do green software**: Sempre priorize seguir os principios do green software (carbon efficiency, energy efficiency, carbon awareness, hardware efficiency).
- **IA eficiente**: minimize o uso de tokens, seja objetivo nas respostas, use os tokens de forma estratégica pra gastar menos energia/tempo.
- Batch > real-time: pipeline roda 1x/dia via cron, não em cada request.
- Use pré-filtros da API da Câmara (`temas=40|41|42`) para reduzir requisições em ~90%.
- Single process: o backend Python FastAPI serve API, classificação e scraping.
- Dark mode como padrão (economiza energia em OLED).
- ISR no Next.js: revalide páginas só quando dados mudam.
- Modelos quantizados (int8 BERT, fase 2).
- GitHub Actions cron às 2h BRT (5h UTC, off-peak).
- **Pergunte-se antes de cada decisão**: "isso consome menos ou mais energia?" Foque em consumir menos.

### 2. Simplicidade (KISS)

- Se um `if` resolve, não use design patterns.
- Sem abstração prematura. Sem Celery, Redis, RabbitMQ.
- FastAPI + SQLAlchemy são o suficiente.
- TypeScript `strict: true`, sem tipos genéricos complexos desnecessários.

### 3. Testabilidade

- **Toda função de classificação deve ter testes** (keyword classifier, ensemble, BERT wrapper).
- **Todo scraper deve ter testes** com mocks das APIs externas (pytest + httpx).
- **Toda rota da API deve ter testes** (FastAPI TestClient + pytest-asyncio).
- **Frontend**: testes com vitest + testing-library (ainda não configurado — TODO Sprint 1).
- Cobertura desejada: 80%. Não bloqueia PR, mas escreva testes para novas features.
- Use `pytest.mark.parametrize` para testar múltiplas variações de ementas.

### 4. Acessibilidade (WCAG 2.1 AA)

- HTML semântico: `<nav>`, `<main>`, `<article>`, `<section>`, não `<div>` genéricos.
- Labels em todo input: `<label htmlFor>` ou `aria-label`. Search inputs devem estar em `<form>`.
- Skip-to-content link, navegação por teclado, `aria-live` para updates dinâmicos.
- Contraste ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande).
- Gráficos devem ter tabela/texto alternativo. Não dependa só de cor.
- **Não use `data-testid`** — busque elementos por roles/labels acessíveis.
- Teste com VoiceOver (macOS) antes de deploy.

### 5. Escalabilidade (desde o dia 1)

- **Paginação em toda lista**: nunca retorne mais de 100 itens sem paginação.
- **Índices no PostgreSQL**: crie índices para colunas usadas em filtros e ordenação (`classification`, `year`, `source`, `final_score`).
- **Idempotência nos scrapers**: rodar o pipeline 2x seguidas não deve duplicar dados. Use `ON CONFLICT (source, external_id) DO UPDATE`.
- **Connection pooling**: use o pool do SQLAlchemy (padrão 5 conexões, suficiente)

### 6. Manutenibilidade

- Type hints em todo Python. TypeScript sem `any` (exceto wrappers de API externa).
- Nomes claros: `classify_bill_keywords()`, não `process()` ou `handle()`. Se o código não está claro, extraia constantes/variáveis/funções com nomes significativos.
- Sem código comentado — delete, git guarda histórico.
- Docstrings em funções públicas (o que faz, parâmetros, retorno).
- README atualizado: sempre que adicionar uma nova feature, verifique se o README continua correto.
- No frontend, prefira cammelcase, no back end prefira snakecase
- Funções, constantes e variáveis devem ter nomes significativos

---

## Stack (versões reais instaladas)

| Camada   | Tecnologia                                                                    |
| -------- | ----------------------------------------------------------------------------- |
| Backend  | Python 3.12+, FastAPI                                                         |
| AI       | Keyword classifier (fase 1). BERTimbau (fase 2)                               |
| Banco    | SQLite (dev local). PostgreSQL/Supabase (prod)                                |
| ORM      | SQLAlchemy 2.0 (sem Alembic — tabelas criadas via `Base.metadata.create_all`) |
| Frontend | Next.js **16**, React 19, Turbopack                                           |
| CSS      | Tailwind **v4** (CSS-first, sem `tailwind.config.ts`)                         |
| UI       | shadcn/ui **v4** (style "base-nova", `@base-ui/react`, **não** Radix)         |
| Pipeline | GitHub Actions cron, workflow_dispatch manual                                 |

---

## Gotchas (agentes frequentemente erram isto)

1. **`shadcn/ui v4 usa @base-ui/react`, NÃO Radix UI.**
   - Button: use `render={<Link />}` no lugar de `asChild`.
   - Badge, Select, Input também têm APIs diferentes do Radix.

2. **Tailwind v4 é CSS-first.** O theming está em `globals.css` com `@theme {}`. Não existe `tailwind.config.ts`.

3. **ESLint v9 flat config** (`eslint.config.mjs`), não `.eslintrc.*`.

4. **Tabelas são criadas automaticamente** no startup (`Base.metadata.create_all`). Não existem migrações Alembic. Se precisar de migrações, configure Alembic primeiro.

5. **Não existe Makefile.** Os comandos `make dev`/`make test` não funcionam. Use os comandos abaixo.

6. **`.env` vai em `backend/`**, não na raiz.

---

## Comandos

```bash
# Backend — sempre ative a venv primeiro (a partir da raiz do projeto)
source backend/.venv/bin/activate
uvicorn backend.main:app --reload          # API em http://localhost:8000
pytest backend/tests -v                    # Testes (20 passando)
python -m backend.pipeline                 # Pipeline manual (classifica + popula banco)

# Frontend
cd frontend
npm run dev                                # http://localhost:3000
npm run build && npm start                 # Produção
npm run lint                               # ESLint

# Database local (SQLite — zero setup)
# Basta configurar backend/.env com: DATABASE_URL=sqlite:///./radar.db
# O arquivo radar.db é criado na raiz automaticamente no primeiro startup.

# CI
# Roda automaticamente às 2h BRT (5h UTC). Testar manualmente:
# gh workflow run "Daily Climate Radar Pipeline"
```

---

## Estrutura (arquivos que realmente existem)

```
radar-ecologico/
├── AGENTS.md
├── README.md
├── .opencode/plans/              # Contexto de sessão para IA
├── backend/
│   ├── main.py                   # FastAPI entrypoint
│   ├── api/routes.py             # GET /api/bills, /api/stats, POST /api/classify
│   ├── classifiers/
│   │   ├── keywords.py           # Classificador por palavras-chave
│   │   └── ensemble.py           # Ensemble (fase 1: 100% keyword)
│   ├── keywords/taxonomy.py      # Taxonomia de termos climáticos
│   ├── scrapers/
│   │   ├── camara.py             # Câmara dos Deputados
│   │   └── senado.py             # Senado Federal
│   ├── database.py               # SQLAlchemy engine + session
│   ├── models.py                 # ORM: Bill, BillSnapshot
│   ├── pipeline.py               # Orquestrador diário
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── tests/
│       ├── test_classifier.py    # 11 testes (parametrized)
│       └── test_scrapers.py      # 4 testes (keyword matching)
├── frontend/
│   ├── src/app/                  # Next.js App Router
│   │   ├── page.tsx              # Dashboard (stats + recent bills)
│   │   └── bills/                # Lista + detalhe [id]
│   ├── src/components/           # BillCard, ClassificationBadge, StatCard, ui/
│   ├── src/lib/api.ts            # Cliente TypeScript (getBills, getStats, etc.)
│   ├── src/lib/utils.ts          # cn(), formatDate(), formatSource(), cores
│   ├── components.json           # shadcn/ui v4 config (base-nova)
│   ├── eslint.config.mjs         # ESLint v9 flat config
│   └── next.config.ts
├── data/                         # PLs rotuladas (CSV) — ainda vazio
├── notebooks/                    # Fine-tuning BERT (fase 2) — ainda vazio
└── .github/workflows/
    └── daily-pipeline.yml        # Cron 2h BRT + manual trigger
```

---

## Fontes de Dados

### APIs (fase 1 — federal)

- **Câmara**: `https://dadosabertos.camara.leg.br/api/v2/proposicoes`
  - Filtros: `siglaTipo=PL|PLP|PEC|MPV`, `ano`, `temas=41|44|48|51|54|61|64|70`
  - Lista completa: `https://dadosabertos.camara.leg.br/api/v2/referencias/proposicoes/codTema`
- **Senado**: `https://legis.senado.leg.br/dadosabertos/materia/pesquisa/lista`
  - Este serviço pode ser descontinuado. Prepare fallbacks.

### Dados Rotulados (treino/validação)

- Observatório do Clima: "Pacote da Destruição" (~70 PLs)
- Plataforma CIPÓ: Radar Legislativo Socioambiental
- Formato: CSV (`external_id, source, ementa, manual_classification`)

---

## Pipeline

O ensemble atual (fase 1) usa 100% keyword classifier. A fase 2 adicionará BERTimbau com pesos: keyword 0.40 + BERT 0.60.

Ordem do pipeline: scrape APIs → filtrar por keywords climáticas → deduplicar contra DB (`ON CONFLICT (source, external_id) DO UPDATE`) → classificar → salvar.
