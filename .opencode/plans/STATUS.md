# Radar Legislativo Ecológico — Status do Projeto

- Keep this file in english
- Go through the items iteratively, try to avoid doing too many unrelated things at the same time to allow me to commit what is really connected

## Última atualização

2026-08-02

## Fase atual

**Sprint 1 — Infraestrutura e Dados (em andamento)**

## O que foi feito

- [x] Sprint 0: Backend, Frontend, CI/CD, Testes, Docs
- [x] Pipeline rodando: scrape Câmara (18 PLs) + Senado (8 PLs) → classificar → salvar
- [x] Mapa de temas climáticos (`CLIMATE_THEME_MAP`) com 15 códigos verificados contra API
- [x] Pré-filtro `codTema` na API da Câmara (reduz requisições)
- [x] Filtro por tema no frontend (dropdown ao lado de Classificação e Fonte)
- [x] Modelo Bill com campos `theme_ids` e `theme_names`
- [x] Correção de datas no Senado (string → datetime)
- [x] Campo `presentation_date` no schema Pydantic serializado como ISO 8601
- [x] UX da barra de classificação com labels e explicação contextual
- [x] Label `favorable` (não `transforming`) em todo o código

## Próximos passos

### Sprint 1 — Infraestrutura e Dados (em andamento)

**Pendente:**

- Revisar tipos/constantes e extrair valores reutilizáveis (evitar duplicação de strings, cores, labels)
- Remover comentários desnecessários do código
- Revisar AGENTS.md e verificar se as boas práticas estão sendo aplicadas no código atual

### Sprint 2 — Detalhes da PL

Melhorar a página de detalhes (`/bills/[id]`) e consistência do frontend:

1. **Autor e partido**: mostrar nome do parlamentar + sigla do partido + UF
2. **Resumo da classificação**: uma frase curta (3-5 palavras) explicando porque a PL recebeu aquela classificação, baseada nas keywords/patterns que deram match
3. **Marcos importantes**: timeline com eventos da tramitação (ex: "Apresentada em 12/05/2026", "Aprovada na Comissão de Meio Ambiente", "Aguardando votação no Plenário")
4. **Votação**: se houve votação em algum âmbito (comissão, plenário), mostrar placar por partido (quantos votaram a favor/contra). Dados disponíveis na API de Votações da Câmara.
5. **Refatorar labels repetidos**: "Combate à crise climática", "Requer revisão humana", etc. estão espalhados em `utils.ts`, `bills-content.tsx`, `page.tsx`. Centralizar em constantes reutilizáveis e buscar outras repetições similares.
6. **Mostrar tema no card**: cada `BillCard` deve exibir o tema da proposta (ex: "Meio Ambiente", "Energia") baseado no campo `theme_names`.
7. **Contagem nos filtros**: dropdowns de Classificação, Fonte e Tema devem mostrar `Nome (N)` indicando quantos projetos existem em cada categoria. Ex: "Meio Ambiente (12)".
8. **Multiselect de temas**: substituir o Select simples de tema por um multiselect. Regra: ao selecionar qualquer tema, "Todos os temas" é desmarcado; ao desmarcar todos, "Todos os temas" volta automaticamente.

### Sprint 3 — Área de Revisão (Admin)

Criar interface para revisores humanos:

1. **Lista de PLs `needs_review`**: dashboard com PLs que requerem revisão humana
2. **Formulário de review**: permitir ao revisor confirmar ou alterar a classificação (`favorable` / `unfavorable` / `needs_review`)
3. **Campo de anotações**: o revisor pode adicionar notas explicando a decisão
4. **Autenticação simples**: senha compartilhada ou magic link (KISS — sem OAuth complexo)
5. **Endpoint `PATCH /api/bills/{id}/review`**: salva `reviewer_classification`, `reviewer_notes`, `reviewed_by`, `reviewed_at`
6. **Novos campos no modelo `Bill`**: `reviewer_classification`, `reviewer_notes`, `reviewed_by`, `reviewed_at`

### Sprint 4 — Infraestrutura (PostgreSQL)

Migrar de SQLite para PostgreSQL no Supabase:

1. Criar projeto no Supabase (free tier)
2. Obter `DATABASE_URL`
3. Configurar `.env` com DATABASE_URL
4. Tabelas criadas automaticamente via `Base.metadata.create_all`
5. Rodar pipeline para popular banco

### Sprint 5 — Revisão Colaborativa (Votação Pública)

Permitir que usuários votem nas classificações para auxiliar os revisores:

1. **Voto por PL**: qualquer visitante pode votar se concorda/discorda da classificação
2. **Contador de votos**: cada PL mostra quantos votos recebeu por categoria (ex: "12 favorável, 3 desfavorável, 5 revisão")
3. **Endpoint `POST /api/bills/{id}/vote`**: recebe `{"vote": "favorable"|"unfavorable"|"needs_review"}`
4. **Modelo `BillVote`**: `bill_id`, `vote`, `voted_at`, `fingerprint` (hash IP+user-agent, evita duplicata sem login)
5. **Anti-duplicação**: mesmo fingerprint vota 1x por PL
6. **UI no detalhe da PL**: seção com 3 botões de voto + barras de proporção

## Bloqueios atuais

- Nenhum.

## Comandos rápidos

```bash
# Backend
source backend/.venv/bin/activate         # a partir da raiz
uvicorn backend.main:app --reload         # API em http://localhost:8000
pytest backend/tests -v                   # Testes
python -m backend.pipeline                # Pipeline manual

# Frontend
cd frontend && npm run dev                # http://localhost:3000
cd frontend && npm run lint               # ESLint
```
