# Radar Legislativo Ecológico

Monitora projetos de lei brasileiros relacionados à crise climática, classificando cada um:

| Label          | Significado                                       |
| -------------- | ------------------------------------------------- |
| `favorable`    | Potencialmente ajuda a combater a crise climática |
| `needs_review` | Requer revisão humana                             |
| `unfavorable`  | Potencialmente intensifica a crise climática      |
| `neutral`      | Reservado à revisão humana (não relacionado ao clima) |

Fontes: APIs públicas da Câmara dos Deputados e do Senado Federal.

---

## Valores e green software

**Green software primeiro.** Toda decisão pesa "consome mais ou menos energia?". Onde aparece:

- **Batch, não real-time** — o pipeline (scrape + classificação) roda **1×/dia às 2h BRT** (off-peak) via GitHub Actions, nunca a cada request.
- **Pré-filtro na API** — a Câmara é filtrada por `codTema` (temas climáticos), reduzindo ~90% das requisições.
- **Frontend estático** — export estático no GitHub Pages (sem servidor 24/7); os dados viram JSON versionado no repo.
- **Classificação leve** — keyword-based (<1 ms/PL), sem modelo de IA carregado em runtime.
- **Dark mode padrão** — economiza energia em OLED.
- **Uma execução diária consolidada** — o deploy às 2h BRT faz scrape → classifica → exporta → publica (sem duplicar scrape).

Outros valores:

- **Acessibilidade WCAG 2.1 AA** — HTML semântico, labels, navegação por teclado, contraste (sem `data-testid`).
- **KISS** — sem abstração prematura; FastAPI + SQLAlchemy são suficientes.
- **Open source** — GitHub Pages, GitHub Actions, Next.js, FastAPI, SQLite (100% gratuito).
- **Testabilidade** — pytest (backend) + vitest (frontend) rodam no CI.

---

## Stack

**Backend:** Python 3.12+, FastAPI, SQLAlchemy (SQLite hoje; PostgreSQL futuro) · **Scrapers:** Câmara + Senado  
**Classificação:** keywords (fase 1); BERTimbau (fase 2)  
**Frontend:** Next.js 16 (export estático), Tailwind v4, shadcn/ui v4  
**CI/Deploy:** GitHub Actions — testes no push/PR; deploy diário às 2h BRT + push

---

## Como a classificação funciona

Palavras-chave em três níveis + padrões regex + verbos de negação/proibição:

- **Combate** (`FIGHTING_KEYWORDS`) → `favorable`
- **Mercado** (`MARKET_KEYWORDS`) — propenso a greenwashing → fracamente positivo → `needs_review`
- **Intensifica** (`NEGATIVE_KEYWORDS`) → `unfavorable`
- Sem sinal claro → `needs_review`, com sub-rótulo na página do PL (ajuda / neutro / atrapalha)

`neutral` é atribuído pela revisão humana (futuro), não pela IA.

---

## Rodar localmente

```bash
# Backend (raiz do projeto)
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload        # API em http://localhost:8000

# Dados + JSON estático
python -m backend.pipeline               # scrape + classifica (SQLite, zero config)
python -m backend.export_static          # gera frontend/public/data/*.json

# Frontend
cd frontend && npm install
npm run dev                              # http://localhost:3000
npm run build                            # site estático em frontend/out
npm run lint && npm test
```

> O `frontend/public/data/*.json` é versionado: um clone limpo já faz `npm run build`
> sem rodar o backend.

---

## CI / Deploy

- **CI** (`.github/workflows/ci.yml`) — testes backend + frontend em todo `push`/PR.
- **Deploy** (`.github/workflows/deploy.yml`) — diário às **2h BRT**: scrape → classifica → exporta JSON → publica no GitHub Pages. No `push`, reimplanta os dados já versionados (sem re-scrape).

Site: https://jubrito.github.io/RadarEcologico/

---

Leia `AGENTS.md` para o detalhamento (princípios, estrutura, gotchas).