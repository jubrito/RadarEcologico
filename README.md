# Radar Legislativo Ecológico

Monitora automaticamente projetos de lei brasileiros relacionados à crise climática. Usa IA para classificar cada PL em três categorias:

| Label          | Significado                                       |
| -------------- | ------------------------------------------------- |
| `transforming` | Potencialmente ajuda a combater a crise climática |
| `needs_review` | Requer análise humana detalhada                   |
| `unfavorable`  | Potencialmente intensifica a crise climática      |

Fontes atuais: Câmara dos Deputados e Senado Federal (APIs públicas). Expansão para estados e municípios em fases futuras.

---

## Stack

**Backend:** Python 3.12, FastAPI, SQLAlchemy, PostgreSQL (Supabase free tier)  
**Classificação:** Ensemble (keywords + BERTimbau na fase 2), Hugging Face  
**Frontend:** Next.js 14 (App Router), Tailwind, shadcn/ui  
**Pipeline:** GitHub Actions (cron diário 2h BRT)  
**Hospedagem:** Vercel (frontend), Fly.io (backend) — free tiers

---

## Rodar localmente

### 1. Backend

> Requer **Python 3.12+**. Nesta máquina: `/opt/homebrew/bin/python3.14`.
> O backend é um pacote (`backend.*`) — rode os comandos de execução a partir da **raiz do projeto**.

```bash
# Instalar dependências
cd backend
python3.14 -m venv .venv         # ou outro Python 3.12+
source .venv/bin/activate
pip install -r requirements.txt

# Banco de dados local (SQLite — zero setup, zero energia)
echo "DATABASE_URL=sqlite:///./radar.db" > .env

# Subir o servidor
cd ..                               # Va para a raiz do projeto
uvicorn backend.main:app --reload   # API em http://localhost:8000
python -m backend.pipeline          # Pipeline manual (classifica e popula)
pytest backend/tests -v             # Testes (20 passando)
```

> **Para produção** (PostgreSQL/Supabase): use `DATABASE_URL=postgresql://...` no `.env` em vez de SQLite.
> As tabelas são criadas automaticamente no startup (`Base.metadata.create_all`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
npm run build                     # Build de produção
```

### 3. Pipeline (CI)

```bash
# Roda diariamente via GitHub Actions (.github/workflows/daily-pipeline.yml)
# Para testar localmente (da raiz do projeto):
python -m backend.pipeline
```

### 4. Ordem recomendada no primeiro setup

1. `cd backend && python3.14 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
2. `echo 'DATABASE_URL=sqlite:///./radar.db' > backend/.env`
3. `uvicorn backend.main:app --reload` (da raiz — tabelas criadas automaticamente)
4. `python -m backend.pipeline` para popular dados iniciais
5. `cd frontend && npm install && npm run dev`

---

## Principios do projeto

- **Green software**: dark mode padrão, batch processing (não real-time), single process, modelos quantizados
- **Acessibilidade WCAG 2.1 AA**: semântica HTML, navegação por teclado, contraste, labels, screen readers
- **KISS**: sem abstração prematura, sem patterns desnecessários, código direto
- **Testabilidade**: testes para classificador, scrapers e rotas (pytest + vitest)

Leia `AGENTS.md` para os princípios completos.

---

## Estrutura

```
radar-ecologico/
├── AGENTS.md                   # Princípios para IA
├── README.md
├── backend/                    # FastAPI + AI + scrapers
│   ├── main.py                 # Entrypoint
│   ├── api/routes.py           # /api/bills, /api/stats, /api/classify
│   ├── classifiers/            # keywords + ensemble (BERT na fase 2)
│   ├── scrapers/               # Câmara + Senado
│   ├── keywords/taxonomy.py    # Taxonomia de termos climáticos
│   ├── database.py             # SQLAlchemy + PostgreSQL
│   ├── models.py               # ORM: Bill, BillSnapshot
│   ├── pipeline.py             # Orquestrador diário
│   └── tests/
├── frontend/                   # Next.js + Tailwind + shadcn/ui
│   └── src/app/                # Dashboard, lista, detalhe
├── data/                       # PLs rotuladas (CSV)
├── notebooks/                  # Fine-tuning BERT (Colab)
└── .github/workflows/          # Cron diário
```
