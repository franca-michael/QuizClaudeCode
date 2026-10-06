# PRD — Quiz Claude Code (Verdadeiro ou Falso)

> Documento destinado a ser consumido pelo Claude Code para construir o projeto. Contém contexto de negócio, requisitos funcionais, especificação técnica, modelo de dados, conteúdo semente e plano de entrega.

---

## 1. Visão geral

**Produto:** aplicação web de quiz "Verdadeiro ou Falso" sobre o Claude Code (a ferramenta de programação agêntica da Anthropic para terminal/IDE/desktop/web).

**Problema:** muita gente (de gestores a devs) ouve falar do Claude Code, mas tem dúvidas conceituais e práticas. Faltam formas leves e divertidas de testar e consolidar o conhecimento.

**Solução:** um quiz de uma rodada única com dificuldade progressiva (do iniciante/negócio ao avançado), com explicação educativa após cada resposta e um placar final.

**Idioma:** PT-BR (estrutura preparada para i18n futuro, mas sem implementá-lo no MVP).

## 2. Objetivos de negócio

| # | Objetivo | Métrica de sucesso |
|---|----------|--------------------|
| 1 | Educar a comunidade (ex.: Jornada de Dados) sobre Claude Code | ≥ 60% dos usuários que começam concluem a rodada |
| 2 | Ser um ativo reutilizável em cursos, aulas e eventos | Link público estável, carregamento < 2 s |
| 3 | Gerar insight sobre lacunas de conhecimento | Taxa de acerto por pergunta disponível via analytics |
| 4 | Manter conteúdo fácil de evoluir | Adicionar pergunta sem alterar código (seed/SQL) |

**Fora do escopo do MVP:** contas de usuário/login, ranking global, compartilhamento social, multi-idioma, painel administrativo com UI, pagamentos.

## 3. Público-alvo e personas

- **Gestor/negócio (iniciante):** quer entender o que é, para quem serve, custo/valor, segurança e riscos em linguagem acessível.
- **Dev/analista (intermediário):** usa ou vai usar no dia a dia; quer validar comandos, fluxo de trabalho, CLAUDE.md, permissões.
- **Power user (avançado):** hooks, MCP, subagents, skills, modo headless, automação em CI.

## 4. Experiência do usuário (fluxo)

1. **Home:** título, breve descrição, botão "Começar". Mostra tempo estimado (~5 min) e número de perguntas.
2. **Rodada:** 15 perguntas em ordem crescente de dificuldade (5 negócio/iniciante → 5 intermediário → 5 avançado), sorteadas do banco de cada nível a cada nova rodada.
3. **Pergunta:** afirmação + dois botões grandes "Verdadeiro" / "Falso". Barra de progresso e indicador do nível atual.
4. **Feedback imediato:** ao responder, mostra acerto/erro (com cor e ícone, não apenas cor), a **explicação** e, quando houver, link para a documentação oficial. Botão "Próxima".
5. **Resultado final:** nota (acertos/15), nível estimado (Iniciante / Intermediário / Avançado / Expert), desempenho por nível, revisão das questões erradas com explicação e botão "Jogar novamente".

**Regra de nível estimado (padrão, configurável em constante):**
- 0–5 acertos: Iniciante · 6–9: Intermediário · 10–13: Avançado · 14–15: Expert.

## 5. Requisitos funcionais

- **RF1** Iniciar nova rodada com 5 perguntas sorteadas por nível (`business`, `intermediate`, `advanced`), sem repetição na rodada.
- **RF2** Exibir uma pergunta por vez, na ordem de nível crescente; embaralhar dentro de cada nível.
- **RF3** Registrar a resposta e exibir feedback com explicação antes de avançar. Não permitir alterar a resposta depois de enviada.
- **RF4** Exibir progresso (ex.: 7/15) e nível atual.
- **RF5** Tela final com nota, nível estimado, desempenho por nível e revisão dos erros.
- **RF6** Enviar eventos anônimos de resposta ao backend (analytics): pergunta, resposta, acerto, tempo de resposta, sessão anônima.
- **RF7** Botão "Jogar novamente" reinicia com novo sorteio.
- **RF8** Suporte a teclado: `V`/`←` = Verdadeiro, `F`/`→` = Falso, `Enter` = Próxima.
- **RF9** Tratamento de erro: se a API falhar, exibir mensagem amigável e botão de tentar novamente; falha no envio de analytics nunca pode bloquear o quiz.

## 6. Requisitos não funcionais

- **Desempenho:** LCP < 2,5 s em 4G; resposta da API < 300 ms (p95).
- **Acessibilidade:** WCAG 2.1 AA — contraste, foco visível, navegação por teclado, `aria-live` para feedback, não depender só de cor.
- **Responsivo:** mobile-first (360 px+) até desktop.
- **Privacidade/LGPD:** sem dados pessoais. Sessão anônima por UUID gerado no cliente; sem cookies de terceiros; sem IP armazenado.
- **Segurança:** a resposta correta e a explicação **não** devem ser enviadas ao cliente antes da resposta (validação no servidor). Rate limiting básico no endpoint de resposta. Chaves apenas em variáveis de ambiente.
- **Observabilidade:** logs de erro no servidor; analytics agregados via SQL/View.
- **Qualidade:** TypeScript estrito, ESLint, Prettier, testes automatizados (ver seção 12).

## 7. Arquitetura técnica

**Stack:**
- **Frontend + backend:** Next.js (App Router) + TypeScript, Route Handlers para API.
- **Estilo:** Tailwind CSS; componentes próprios simples (sem biblioteca pesada). Suporte a modo claro/escuro via `prefers-color-scheme` e toggle.
- **Banco:** Supabase (PostgreSQL gerenciado). Acesso pelo servidor com `@supabase/supabase-js` usando a service role key **apenas no servidor**.
- **Validação:** Zod para payloads.
- **Testes:** Vitest (unidade), Playwright (E2E do fluxo principal).
- **Deploy:** Vercel (app) + Supabase (banco). CI com GitHub Actions: lint, typecheck, testes.
- **Gerenciador de pacotes:** pnpm (ou npm, se preferir).

**Decisão de segurança central:** o cliente recebe a pergunta **sem** o gabarito. Ao responder, o cliente chama `POST /api/answer`; o servidor compara, grava o evento e devolve `{ correct, explanation, source_url }`. A tela final usa o histórico de respostas guardado em memória no cliente.

### 7.1 Estrutura de pastas sugerida

```
/
├─ prd.md
├─ README.md
├─ .env.example
├─ supabase/
│  ├─ migrations/0001_init.sql
│  └─ seed.sql                  # perguntas iniciais
├─ src/
│  ├─ app/
│  │  ├─ page.tsx               # Home
│  │  ├─ quiz/page.tsx          # Rodada
│  │  ├─ result/page.tsx        # Resultado (ou estado na própria rota /quiz)
│  │  └─ api/
│  │     ├─ round/route.ts      # GET: sorteia 15 perguntas (sem gabarito)
│  │     └─ answer/route.ts     # POST: valida resposta e grava evento
│  ├─ components/               # QuestionCard, ProgressBar, FeedbackPanel, ResultSummary...
│  ├─ lib/
│  │  ├─ supabase-server.ts
│  │  ├─ scoring.ts             # cálculo de nota e nível
│  │  └─ schemas.ts             # Zod
│  └─ types/
└─ tests/ (unit + e2e)
```

### 7.2 Modelo de dados (PostgreSQL / Supabase)

```sql
create type difficulty as enum ('business', 'intermediate', 'advanced');

create table questions (
  id            uuid primary key default gen_random_uuid(),
  statement     text not null,                -- afirmação a ser julgada
  is_true       boolean not null,             -- gabarito
  explanation   text not null,                -- explicação exibida após responder
  difficulty    difficulty not null,
  topic         text not null,                -- ex.: 'conceitos', 'comandos', 'hooks', 'mcp'
  source_url    text,                         -- link da documentação oficial
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table answer_events (
  id            bigint generated always as identity primary key,
  session_id    uuid not null,                -- UUID anônimo gerado no cliente
  question_id   uuid not null references questions(id),
  answer        boolean not null,
  correct       boolean not null,
  time_ms       integer,
  created_at    timestamptz not null default now()
);

create index on answer_events (question_id);
create index on questions (difficulty) where active;

-- View de analytics: taxa de acerto por pergunta
create view question_stats as
select q.id, q.statement, q.difficulty, q.topic,
       count(e.id) as total_answers,
       round(100.0 * avg(case when e.correct then 1 else 0 end), 1) as hit_rate
from questions q left join answer_events e on e.question_id = q.id
group by q.id;
```

**RLS:** habilitar Row Level Security em ambas as tabelas, sem políticas públicas. Todo acesso passa pelas rotas do servidor com a service role key.

### 7.3 Contratos de API

**`GET /api/round`** → `200`
```json
{
  "questions": [
    { "id": "uuid", "statement": "...", "difficulty": "business", "topic": "conceitos" }
  ]
}
```
Retorna 15 itens (5 por nível, ordenados business → intermediate → advanced). Nunca inclui `is_true`/`explanation`.

**`POST /api/answer`** — body: `{ "sessionId": "uuid", "questionId": "uuid", "answer": true, "timeMs": 4200 }`
→ `200`: `{ "correct": true, "explanation": "...", "sourceUrl": "https://..." }`
→ `400` payload inválido · `404` pergunta inexistente · `429` rate limit.

### 7.4 Variáveis de ambiente (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=      # somente servidor, nunca expor ao cliente
```

## 8. Design e UI

- **Estilo:** minimalista, inspirado na identidade do Claude: fundo creme (`#FAF9F5`), texto escuro (`#1F1E1D`), cor de destaque terracota/laranja (`#D97757`); modo escuro com fundo `#1F1E1D`. Definir como variáveis CSS/tokens do Tailwind.
- **Tipografia:** sans-serif limpa (ex.: Inter) para UI; fonte mono apenas para trechos de comando (`/init`, `CLAUDE.md`).
- **Componentes:** `QuestionCard`, botões "Verdadeiro"/"Falso" grandes, `ProgressBar`, `FeedbackPanel` (acerto/erro + explicação + link), `LevelBadge`, `ResultSummary`.
- **Microinterações:** transição suave entre perguntas; sem animações pesadas; respeitar `prefers-reduced-motion`.
- Trechos de código/comandos nas afirmações devem ser renderizados com `<code>`.

## 9. Conteúdo: regras de autoria das perguntas

- Banco inicial: **45 perguntas** (15 por nível), ~50% verdadeiras e ~50% falsas em cada nível.
- Afirmações curtas, objetivas, sem ambiguidade; evitar negações duplas e "pegadinhas" por redação.
- Toda pergunta tem explicação (1–3 frases) e, quando possível, `source_url` da documentação oficial (`https://docs.claude.com/` / `https://code.claude.com/docs`).
- **Fatos mudam rápido:** antes de finalizar o seed, o Claude Code deve **verificar cada afirmação na documentação oficial atual** (preços, limites, nomes de comandos e recursos mudam). Se não for possível verificar, substituir a pergunta por uma de conceito estável.
- Níveis:
  - **business:** o que é, para quem, valor, segurança/privacidade, governança, custos em alto nível.
  - **intermediate:** comandos, CLAUDE.md, modos de permissão, plan mode, contexto, fluxo de trabalho.
  - **advanced:** hooks, MCP, subagents, skills, modo headless/SDK, automação, worktrees.

### 9.1 Perguntas semente (exemplos para o `seed.sql`; completar até 15 por nível)

> Cada item: afirmação → gabarito → explicação. Validar contra a documentação oficial antes de gravar.

**Negócio / Iniciante**
1. "O Claude Code é uma ferramenta que pode ler arquivos, editar código e executar comandos no projeto do usuário." → **Verdadeiro.** É um assistente agêntico, não apenas um chat de perguntas e respostas.
2. "O Claude Code só funciona dentro do navegador, sem acesso ao terminal." → **Falso.** Roda no terminal e também em IDEs, app desktop e web.
3. "Por padrão, o Claude Code pede permissão antes de executar ações sensíveis, como editar arquivos ou rodar comandos." → **Verdadeiro.** O sistema de permissões é um pilar de segurança e controle.
4. "Usar o Claude Code dispensa qualquer revisão humana do código gerado." → **Falso.** A revisão humana continua sendo boa prática e responsabilidade da equipe.
5. "O Claude Code só serve para quem programa em Python." → **Falso.** Atua em diversas linguagens e tipos de projeto.
6. "O Claude Code pode ajudar também em tarefas como explicar uma base de código, escrever testes e documentar." → **Verdadeiro.**

**Intermediário**
1. "O arquivo `CLAUDE.md` serve para dar ao Claude instruções e contexto persistente sobre o projeto." → **Verdadeiro.**
2. "O comando `/init` cria um `CLAUDE.md` inicial analisando o projeto." → **Verdadeiro.**
3. "O comando `/clear` apaga os arquivos do projeto." → **Falso.** Limpa o histórico/contexto da conversa, não os arquivos.
4. "O comando `/compact` resume a conversa para liberar espaço na janela de contexto." → **Verdadeiro.**
5. "No plan mode, o Claude executa imediatamente todas as edições sem mostrar um plano." → **Falso.** O plan mode propõe um plano para aprovação antes de agir.
6. "Pressionar `Esc` duas vezes permite voltar a um ponto anterior da conversa (rewind)." → **Verdadeiro** *(verificar na doc atual)*.

**Avançado**
1. "Hooks permitem executar comandos automaticamente em eventos do ciclo de vida, como antes ou depois do uso de uma ferramenta." → **Verdadeiro.**
2. "O MCP (Model Context Protocol) permite conectar o Claude Code a ferramentas e fontes de dados externas." → **Verdadeiro.**
3. "Subagents compartilham obrigatoriamente o mesmo contexto da conversa principal." → **Falso.** Têm contexto próprio e retornam um resumo ao agente principal.
4. "É possível rodar o Claude Code de forma não interativa, via script, com a flag `-p`." → **Verdadeiro.**
5. "Skills são pacotes de instruções que o Claude pode carregar quando relevantes à tarefa." → **Verdadeiro.**
6. "Configurações de permissões do projeto podem ser versionadas em `.claude/settings.json`." → **Verdadeiro.**

## 10. Requisitos de analytics

- Coletar apenas `answer_events` (sem dados pessoais).
- Disponibilizar a view `question_stats` para consulta no painel SQL do Supabase.
- Critério de revisão de conteúdo: perguntas com hit rate < 20% ou > 95% (com ≥ 30 respostas) devem ser reavaliadas.

## 11. Critérios de aceite do MVP

- [ ] Uma rodada completa de 15 perguntas funciona de ponta a ponta no mobile e no desktop.
- [ ] O gabarito não aparece na resposta de `/api/round` (verificado em teste).
- [ ] Feedback com explicação em toda resposta; tela final com nota, nível e revisão dos erros.
- [ ] Eventos gravados em `answer_events`; falha de gravação não quebra a experiência.
- [ ] Banco com ≥ 45 perguntas válidas (15 por nível), seed reproduzível.
- [ ] Navegação por teclado e leitor de tela funcionando; contraste AA.
- [ ] Lighthouse: Acessibilidade ≥ 95, Performance ≥ 90.
- [ ] CI verde (lint, typecheck, testes) e deploy na Vercel.

## 12. Estratégia de testes

- **Unidade (Vitest):** `scoring.ts` (nota e níveis nas bordas), sorteio da rodada (5 por nível, sem repetição), schemas Zod.
- **API:** `/api/round` não vaza gabarito; `/api/answer` valida entrada e retorna correção certa.
- **E2E (Playwright):** fluxo completo Home → 15 perguntas → resultado → jogar novamente; teste em viewport mobile.

## 13. Plano de entrega (ordem sugerida para o Claude Code)

1. **Setup:** criar projeto Next.js + TS + Tailwind + ESLint/Prettier; `.env.example`; README com instruções.
2. **Banco:** migration `0001_init.sql`, RLS, seed com as 45 perguntas (verificadas).
3. **Backend:** `GET /api/round` e `POST /api/answer` com Zod e rate limit simples.
4. **Frontend:** Home → Quiz → Feedback → Resultado, com tema claro/escuro e teclado.
5. **Analytics:** envio de eventos + view `question_stats`.
6. **Qualidade:** testes unitários, API e E2E; ajustes de acessibilidade.
7. **Deploy:** CI + Vercel + Supabase; documentar variáveis de ambiente.

## 14. Roadmap pós-MVP (não implementar agora)

- Ranking global com apelido; compartilhar resultado (LinkedIn/X/WhatsApp).
- Escolha por tema/nível; modo "treino" com perguntas erradas.
- Painel admin para CRUD de perguntas; i18n (EN).
- Perguntas com múltipla escolha e perguntas de "cenário".

## 15. Riscos e premissas

| Risco | Mitigação |
|-------|-----------|
| Conteúdo desatualizado (Claude Code evolui rápido) | Campo `source_url`, revisão periódica, verificação na doc antes do seed |
| Vazamento do gabarito no cliente | Validação só no servidor; teste automatizado |
| Abuso/spam nos endpoints | Rate limit + validação Zod; sem dados sensíveis expostos |
| Chave de serviço exposta | Uso apenas no servidor; `.env` fora do git |

**Premissas:** o dono do projeto possui conta no Supabase e na Vercel; o público é majoritariamente brasileiro; sem requisito de login.
