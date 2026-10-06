# Quiz Claude Code (Verdadeiro ou Falso)

> **Projeto didático.** Este repositório existe **para fins educacionais e de aprendizado do Claude Code**: foi construído passo a passo com o próprio Claude Code para praticar planejamento, desenvolvimento assistido, testes, banco de dados e deploy. Não é um produto comercial, não tem suporte e não representa a Anthropic. O conteúdo das perguntas foi conferido na [documentação oficial](https://code.claude.com/docs) em 2026-10-06, mas ela muda com frequência: em caso de dúvida, a documentação oficial é a fonte da verdade.

Quiz de 15 perguntas V/F sobre o Claude Code, com dificuldade progressiva (5 de negócio, 5 intermediárias e 5 avançadas). Ao final mostra a nota, o nível estimado, o desempenho por nível e a revisão dos erros. Especificação completa em [`prd.md`](./prd.md).

**Demo:** https://quiz-claude-code-sage.vercel.app

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Zod · Supabase (Postgres) · Vitest · Playwright · Vercel.

## Desenvolvimento

```bash
cp .env.example .env.local   # preencha as variáveis do Supabase
npm install
npm run dev
```

| Comando             | O que faz                                        |
| ------------------- | ------------------------------------------------ |
| `npm run lint`      | ESLint                                           |
| `npm run typecheck` | `tsc --noEmit`                                   |
| `npm test`          | Vitest (unidade e API)                           |
| `npm run test:e2e`  | Playwright (build de produção, desktop e mobile) |
| `npm run format`    | Prettier                                         |

## Banco de dados

No SQL Editor do seu projeto Supabase, execute nesta ordem:

1. `supabase/migrations/0001_init.sql`: tabelas, view `question_stats` e RLS.
2. `supabase/seed.sql`: 45 perguntas (15 por nível). Atenção: o seed apaga e recarrega as perguntas.

## Variáveis de ambiente

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`: somente servidor, nunca expor ao cliente.

O `.env.local` está no `.gitignore`. **Nunca versione chaves, senhas ou tokens.**

## Decisões de segurança

- O gabarito (`is_true` e `explanation`) nunca vai ao cliente antes da resposta; a correção é feita no servidor.
- O Supabase é acessado só pelo servidor, com RLS habilitado e sem políticas públicas.
- Sessão anônima por UUID gerado no cliente; sem login, sem dados pessoais e sem IP armazenado.
- Cabeçalhos de segurança em todas as rotas (`next.config.ts`).

## Fora do escopo

Login, ranking, compartilhamento, i18n e painel de administração.
