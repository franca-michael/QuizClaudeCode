# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual

Fases 0–3 concluídas: setup, banco Supabase (migração + seed de 45 perguntas aplicados), API (`/api/round`, `/api/answer`) e frontend (home, `/quiz`, feedback, resultado, tema, atalhos) implementados. **npm** como gerenciador (pnpm não está instalado). O PRD (`prd.md`) é a fonte da verdade; o plano de entrega está na seção 13. E2E em `tests/e2e` roda contra `next build` + `next start` (1 worker). Antes de publicar, ainda é preciso verificar as perguntas do seed na documentação oficial.

@AGENTS.md

## Comandos

- `npm run dev` · `npm run build`
- `npm run lint` · `npm run typecheck` · `npm run format`
- `npm test` (Vitest, só `tests/unit/**/*.test.ts`); um arquivo: `npx vitest run tests/unit/arquivo.test.ts`; um teste: `npx vitest run -t "nome"`
- `npm run test:e2e` (Playwright, specs em `tests/e2e`)

## Produto

Quiz "Verdadeiro ou Falso" sobre o Claude Code, em PT-BR. Uma rodada = 15 perguntas, 5 por nível (`business` → `intermediate` → `advanced`), sorteadas do banco a cada rodada, embaralhadas dentro do nível, sem repetição. Feedback com explicação após cada resposta e tela final com nota, nível estimado (0–5 Iniciante, 6–9 Intermediário, 10–13 Avançado, 14–15 Expert; limites em constante configurável), desempenho por nível e revisão dos erros.

## Arquitetura (decisões que atravessam vários arquivos)

- **Stack:** Next.js App Router + TypeScript estrito, Route Handlers como API, Tailwind, Zod, Supabase (Postgres) via `@supabase/supabase-js`, deploy Vercel.
- **Gabarito nunca vai ao cliente antes da resposta.** `GET /api/round` devolve 15 perguntas (`id, statement, difficulty, topic`) sem `is_true`/`explanation`. `POST /api/answer` (`{sessionId, questionId, answer, timeMs}`) compara no servidor, grava em `answer_events` e devolve `{correct, explanation, sourceUrl}`. Erros: 400 payload inválido, 404 pergunta inexistente, 429 rate limit. Deve haver teste automatizado garantindo que `/api/round` não vaza o gabarito.
- **Supabase só no servidor** com a service role key (`SUPABASE_SERVICE_ROLE_KEY`, nunca `NEXT_PUBLIC_`). RLS habilitado em `questions` e `answer_events`, sem políticas públicas. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Estado da rodada fica no cliente** (histórico de respostas em memória) e alimenta a tela final. Sessão anônima = UUID gerado no cliente; sem dados pessoais, sem IP armazenado.
- **Analytics nunca bloqueia o quiz:** falha ao gravar o evento não pode quebrar a experiência. Taxa de acerto por pergunta vem da view SQL `question_stats`.
- **Conteúdo é dado, não código:** perguntas vivem em `supabase/seed.sql` (reproduzível), schema em `supabase/migrations/0001_init.sql` (modelo completo na seção 7.2 do PRD). Meta: 45 perguntas, 15 por nível, ~50% V / ~50% F.
- Lógica de nota/nível em `src/lib/scoring.ts`, schemas Zod em `src/lib/schemas.ts`, cliente Supabase em `src/lib/supabase-server.ts`.

## Regras de conteúdo

- Antes de finalizar o seed, **verifique cada afirmação na documentação oficial atual** (`https://code.claude.com/docs`, `https://docs.claude.com/`); se não der para verificar, troque por pergunta de conceito estável. As perguntas semente do PRD (seção 9.1) são exemplos, não verificadas.
- Afirmações curtas, sem ambiguidade, sem dupla negação; explicação de 1–3 frases; `source_url` quando possível. Comandos em `<code>`.

## UI / acessibilidade

- Tokens: fundo `#FAF9F5`, texto `#1F1E1D`, destaque `#D97757`; modo escuro (fundo `#1F1E1D`) via `prefers-color-scheme` + toggle. Mobile-first (360px+).
- Teclado: `V`/`←` = Verdadeiro, `F`/`→` = Falso, `Enter` = Próxima. Não permitir trocar a resposta depois de enviada.
- WCAG 2.1 AA: acerto/erro com ícone além de cor, `aria-live` no feedback, foco visível, respeitar `prefers-reduced-motion`.
- Fora do escopo do MVP (não implementar): login, ranking, compartilhamento, i18n, painel admin (seção 14).
