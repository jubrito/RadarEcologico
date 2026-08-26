# Radar Legislativo Ecológico

Monitora automaticamente projetos de lei brasileiros relacionados à crise climática. Usa IA para classificar cada PL em três categorias:

| Label          | Significado                                       |
| -------------- | ------------------------------------------------- |
| `favorable`    | Potencialmente ajuda a combater a crise climática |
| `needs_review` | Requer análise humana detalhada                   |
| `unfavorable`  | Potencialmente intensifica a crise climática      |

Fontes atuais: Câmara dos Deputados e Senado Federal (APIs públicas). Expansão para estados e municípios em fases futuras.

Na página de detalhes de cada PL você vê a classificação, os temas, o autor e a **linha do tempo da tramitação** (com a situação atual destacada).

---

## Como a classificação funciona

O classificador usa palavras-chave em três níveis (além de padrões regex e verbos de negação/proibição):

- **Combate** (`FIGHTING_KEYWORDS`): ação climática genuína — proteção, restauração, renováveis, transição justa, povos indígenas e tradicionais. Empurra fortemente para `favorable`.
- **Mercado** (`MARKET_KEYWORDS`): mecanismos de mercado propensos a greenwashing — crédito/mercado de carbono, hidrogênio verde, "baixo carbono", compensação de emissões. Empurra fracamente, então sozinhos caem em `needs_review` (não pioram, mas não resolvem).
- **Intensifica** (`NEGATIVE_KEYWORDS`): termos que agravam a crise — flexibilização de licenciamento, mineração em terra indígena, subsídios a combustíveis fósseis. Empurra para `unfavorable`.

Verbos de negação ("revoga a proteção ambiental") e proibição ("proíbe a mineração") invertem o sinal do termo.

---

## Stack

**Backend:** Python 3.12+, FastAPI, SQLAlchemy, PostgreSQL (Supabase free tier)  
**Classificação:** Ensemble (keywords + BERTimbau na fase 2), Hugging Face  
**Frontend:** Next.js 16 (App Router), Tailwind v4, shadcn/ui v4  
**Pipeline:** GitHub Actions (cron diário 2h BRT)  
**Hospedagem:** Vercel (frontend), Fly.io (backend) — free tiers

---

## Primeira vez — setup único

> Requer **Python 3.12+**. O backend é um pacote (`backend.*`) — rode os comandos a partir da **raiz do projeto**.

```bash
# 1. Criar venv e instalar dependências
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Configurar banco local (SQLite — zero setup)
echo 'DATABASE_URL=sqlite:///./radar.db' > .env
cd ..

# 3. Instalar dependências do frontend
cd frontend
npm install
cd ..
```

> Pronto. Tabelas são criadas automaticamente no primeiro startup do backend.
> Para produção (PostgreSQL/Supabase): use `DATABASE_URL=postgresql://...` no `backend/.env`.

---

## No dia a dia — rode sempre que desenvolver

```bash
# Ativar venv (uma vez por terminal, a partir da raiz)
source backend/.venv/bin/activate

# Backend
uvicorn backend.main:app --reload       # API em http://localhost:8000
python -m backend.pipeline              # Pipeline manual (classifica + popula)
pytest backend/tests -v                 # Testes

# Frontend (outro terminal)
cd frontend
npm run dev                             # http://localhost:3000
npm run build && npm start              # Produção
npm run lint                            # ESLint
npm test                                # Vitest

# CI: rodar pipeline manualmente via GitHub
# gh workflow run "Daily Climate Radar Pipeline"
```

---

## Pipeline (CI)

O pipeline roda diariamente às 2h BRT via GitHub Actions (`.github/workflows/daily-pipeline.yml`).
Para testar manualmente: `python -m backend.pipeline` (da raiz, com venv ativa).

---

## Princípios do projeto

- **Green software**: dark mode padrão, batch processing (não real-time), single process, modelos quantizados
- **Acessibilidade WCAG 2.1 AA**: semântica HTML, navegação por teclado, contraste, labels, screen readers
- **KISS**: sem abstração prematura, sem patterns desnecessários, código direto
- **Testabilidade**: testes para classificador, scrapers e rotas (pytest + vitest)
- **Open Source**: prioriza projetos, ferramentas e tecnologias de código livre

Leia `AGENTS.md` para os princípios completos.

---

## Estrutura

```
radar-ecologico/
├── AGENTS.md                   # Princípios para IA
├── README.md
├── backend/                    # FastAPI + AI + scrapers
│   ├── main.py                 # Entrypoint
│   ├── api/routes.py           # /api/bills, /api/bills/{id}/tramitacoes, /api/stats, /api/classify
│   ├── classifiers/            # keywords + ensemble (BERT na fase 2)
│   ├── scrapers/               # Câmara + Senado
│   ├── keywords/taxonomy.py    # Taxonomia de termos climáticos
│   ├── database.py             # SQLAlchemy + SQLite/PostgreSQL
│   ├── models.py               # ORM: Bill, BillSnapshot
│   ├── pipeline.py             # Orquestrador diário
│   └── tests/
├── frontend/                   # Next.js + Tailwind + shadcn/ui
│   └── src/app/                # Dashboard, lista, detalhe
├── data/                       # PLs rotuladas (CSV)
├── notebooks/                  # Fine-tuning BERT (Colab)
└── .github/workflows/          # Cron diário
```
