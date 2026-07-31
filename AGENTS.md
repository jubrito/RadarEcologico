# AGENTS.md — Radar Legislativo Ecológico

> Instruções permanentes para agentes de IA (OpenCode, Cursor, Copilot, etc.) que desenvolvem este projeto. Leia antes de qualquer alteração.

---

## Missão do Projeto

Identificar automaticamente Projetos de Lei (PLs) propostos no Congresso Nacional,
Assembleias Legislativas e Câmaras Municipais, classificando-os em:

- ✅ **Potencialmente ajuda a combater a crise climática** (favorável)
- ❌ **Potencialmente piora a crise climática** (desfavorável)
- ⚠️ **Requer revisão humana** (revisão necessária)

Âmbito: Brasil. Fontes primárias: APIs públicas da Câmara dos Deputados e Senado
Federal. Expansão futura para legislativos estaduais e municipais.

---

## Princípios (siga sempre, sem exceção)

### 1. Green Software First

- **Principios do green software**: Sempre priorize seguir os principios do green software (carbon efficiency, energy efficiency, carbon awarenes, hardware efficiency)
- **Minimize computação**: prefira processamento em lote a tempo real. Classificação
  roda 1x/dia via cron, não em cada request.
- **Sem chamadas desnecessárias**: use pré-filtros da API (ex: `temas` da Câmara)
  para reduzir requisições em ~90%.
- **Single process sempre que possível**: o backend Python FastAPI serve API,
  classificação e scraping — um processo, sem sidecars.
- **Dark mode como padrão**: economiza energia em telas OLED/AMOLED.
- **Modelos quantizados**: carregue BERT com int8 para reduzir RAM e consumo
  energético em ~50%.
- **Rode em off-peak**: GitHub Actions cron às 2h BRT (madrugada, grade menos
  demandada).
- **ISR no Next.js**: revalide páginas só quando dados mudam. Cache agressivo.
- **Pergunte-se antes de cada decisão**: "isso consome menos ou mais energia?" Foque em consumir menos energia e emitir menos carbono.
- **IA eficiente**: minimize o uso de tokens, seja objetivo nas respostas, use os tokens de forma estratégica pra gastar menos energia/tempo.

### 2. Simplicidade (KISS)

- **Evite complexidade a todo custo**. Se um `if` resolve, não use strategy pattern.
- **Sem design patterns sem problema concreto**
- **Menos arquivos é melhor**: prefira poucos arquivos bem estruturados a muitos
  arquivos com 10 linhas cada.
- **Python puro sobre frameworks obscuros**: FastAPI + SQLAlchemy são o suficiente.
  Não adicione Celery, Redis, RabbitMQ a menos que seja estritamente necessário.
- **TypeScript estrito, mas sem exagero**: use `strict: true` no tsconfig.
  Não crie tipos genéricos complexos sem necessidade real.

### 3. Testabilidade

- **Toda função de classificação deve ter testes** (keyword classifier, ensemble,
  BERT wrapper).
- **Todo scraper deve ter testes** com mocks das APIs externas (pytest + responses
  ou httpx mock).
- **Toda rota da API deve ter testes** (FastAPI TestClient + pytest-asyncio).
- **Frontend**: testes unitarios com RTL+jst nos componentes, testes de integração para
  fluxos críticos (vitest + testing-library).
- **Cobertura mínima desejada**: 80%. Não bloqueie PR por cobertura, mas
  escreva testes para cada nova feature (buscando cobrir os requisitos do codigo escrito).
- **Use pytest.mark.parametrize** para testar múltiplas variações de ementas.

### 4. Acessibilidade (WCAG 2.1 AA)

- **Semântica HTML correta**: `<nav>`, `<main>`, `<article>`, `<section>` no lugar
  de `<div>` genéricos.
- **Labels em todo input/formulário**: use `<label htmlFor>` ou `aria-label` quando isso for melhorar a acessibilidade.
- **Navegação por teclado**: todos os elementos interativos devem ser focáveis
  e operáveis sem mouse e acessiveis considerando screen readers. Skip-to-content link.
- **Contraste mínimo**: 4.5:1 para texto normal, 3:1 para texto grande.
- **Screen readers**: use `aria-live` para atualizações dinâmicas, `role` adequado
  em componentes customizados.
- **Testes**: No front-end, não use datatestid pois buscar o elemento usando componentes acessiveis ajudará a testar acessibilidade
- **Gráficos**: toda visualização de dados deve ter uma tabela/texto alternativo.
  Não dependa apenas de cor ou algo visual para transmitir informação.
- **Teste com VoiceOver (macOS) antes de deploy**.

### 5. Escalabilidade (desde o dia 1)

- **Paginação em toda lista**: nunca retorne mais de 100 itens sem paginação.
- **Índices no PostgreSQL**: crie índices para colunas usadas em filtros e
  ordenação (`classification`, `year`, `source`, `final_score`).
- **Idempotência nos scrapers**: rodar o pipeline 2x seguidas não deve duplicar
  dados. Use `ON CONFLICT (source, external_id) DO UPDATE`.
- **Materialized views** para dashboards e agregações pesadas.
- **Connection pooling**: use o pool do SQLAlchemy (padrão 5 conexões no
  pool_size, suficiente para este projeto).

### 6. Manutenibilidade

- **Type hints em todo código Python**: funções, métodos, variáveis complexas.
- **TypeScript strict mode**: sem `any` exceto em wrappers de API externa.
- **Docstrings em funções públicas**: descreva o que a função faz, parâmetros,
  retorno. Não descreva o óbvio.
- **Nomes claros**: `classify_bill_keywords()` — não `process()`, `handle()`,
  `do_stuff()`. Se o código não esta muito claro, extraia constantes/variaveis/funções com nomes significativos que ajudem a exclarecer o que esta sendo executado.
- **Sem código comentado**: se não é usado, delete. Git guarda histórico.
- **README atualizado**: sempre que adicionar uma nova feature, se pergunte
  se o README ainda está correto.
- **Um comando para rodar tudo**: `make dev` sobe backend + frontend.
  `make test` roda todos os testes.

---

## Stack Tecnológica

| Camada   | Tecnologia                                   | Justificativa                                                  |
| -------- | -------------------------------------------- | -------------------------------------------------------------- |
| Backend  | Python 3.12, FastAPI                         | Ecossistema AI (transformers, datasets), async nativo, simples |
| AI/NLP   | Hugging Face, BERTimbau                      | Modelo PT-BR, open-source, gratuito                            |
| Banco    | PostgreSQL (Supabase free)                   | Full-text search em português, confiável, gratuito             |
| ORM      | SQLAlchemy 2.0 + Alembic                     | Maduro, bem documentado, async support                         |
| Frontend | Next.js 14 (App Router), Tailwind, shadcn/ui | SSR/ISR, dark mode nativo                                      |
| Pipeline | GitHub Actions cron                          | Gratuito para projetos públicos, 2000 min/mês                  |
| Hosting  | Vercel (frontend), Fly.io (backend)          | Free tiers generosos, deploy simples                           |

---

## Classificação (3 labels)

| Label          | Score       | Significado                                               |
| -------------- | ----------- | --------------------------------------------------------- |
| `favorable`    | < 0.30      | ✅ Potencialmente Ajuda a combater a catástrofe climática |
| `needs_review` | 0.30 - 0.60 | ⚠️ Requer análise humana                                  |
| `unfavorable`  | ≥ 0.60      | ❌ Potencialmente intensifica a catástrofe climática      |

O ensemble combina:

- **Keyword classifier (peso 0.40)**: alta precisão, zero custo computacional
- **BERTimbau fine-tuned (peso 0.60)**: nuance e contexto, adicionado na Fase 2

---

## Fontes de Dados

### APIs Públicas (fase 1 — federal)

- **Câmara dos Deputados**: `https://dadosabertos.camara.leg.br/api/v2/`
  - Endpoint principal: `/proposicoes` (filtro por `siglaTipo`, `ano`, `temas`)
  - Temas relevantes: 40 (Meio Ambiente), 41 (Recursos Hídricos), 42 (Energia)
- **Senado Federal**: `https://legis.senado.leg.br/dadosabertos/`
  - Endpoint: `/materia/pesquisa/lista` (filtro por `ano`).
  - Atenção: A documentação do Senado indica que este serviço pode ser descontinuado em breve, sendo substituído por uma nova versão. Apesar do monitoramento manual de possíveis atualizações ser realizado, prepare-se para um cenário em que isso aconteça sem que todo o sistema quebre de forma inesperada e sem feedback.

### Dados Rotulados (para treino e validação)

- **Observatório do Clima** — "Pacote da Destruição" (~70 PLs com labels manuais)
  - **Agenda legislativa 2026**: `https://oc.eco.br/wp-content/uploads/2026/07/OC-Agenda-Legislativa-2026_Versao-Web.pdf`
  - **Observatorio do clima**: `https://oc.eco.br/`
- **Plataforma CIPÓ** — Radar Legislativo Socioambiental `https://plataformacipo.org/`
- **Formato**: CSV com colunas `external_id, source, ementa, manual_classification`

---

## Comandos

```bash
# Backend
source backend/.venv/bin/activate.   # Run from root
uvicorn backend.main:app --reload    # Dev server (http://localhost:8000)
pytest backend/tests -v              # Run all tests (ou: cd backend && pytest -v)
python -m backend.pipeline           # Run pipeline manually (exige PostgreSQL)

# Frontend
cd frontend
npm run dev                        # Dev server (localhost:3000)
npm run build && npm start         # Production build
npm run test                       # Run tests (vitest)

# Database
source backend/.venv/bin/activate
alembic upgrade head               # Apply migrations (requer alembic.ini + env.py)
alembic revision --autogenerate    # Create migration from model changes
```

---

## Estrutura de Diretórios

```
radar-ecologico/
├── AGENTS.md                      # ← este arquivo
├── README.md
├── backend/
│   ├── main.py                    # FastAPI entrypoint
│   ├── api/routes.py              # Endpoints REST
│   ├── scrapers/
│   │   ├── camara.py              # Câmara dos Deputados
│   │   └── senado.py              # Senado Federal
│   ├── classifiers/
│   │   ├── keywords.py            # Classificador por palavras-chave
│   │   ├── bert_model.py          # Wrapper BERT (fase 2)
│   │   └── ensemble.py            # Combina keywords + BERT
│   ├── keywords/taxonomy.py       # Taxonomia de palavras-chave climáticas
│   ├── database.py                # Conexão DB + session
│   ├── models.py                  # ORM (Bill, BillSnapshot)
│   ├── pipeline.py                # Orquestrador diário
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── tests/
├── frontend/
│   ├── src/app/                   # Next.js App Router
│   ├── src/components/            # Componentes React
│   └── src/lib/api.ts             # Cliente TypeScript p/ backend
├── notebooks/
│   └── fine_tune_bert.ipynb       # Fine-tuning BERTimbau (Colab)
├── data/
│   └── labeled_bills.csv          # PLs rotuladas manualmente
└── .github/workflows/
    └── daily-pipeline.yml         # Cron diário
```
