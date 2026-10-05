# Quiz Claude Code (Verdadeiro ou Falso)

Quiz de 15 perguntas V/F sobre o Claude Code, com dificuldade progressiva. Especificação completa em [`prd.md`](./prd.md).

## Desenvolvimento

```bash
cp .env.example .env.local   # preencha as variáveis do Supabase
npm install
npm run dev
```

| Comando | O que faz |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unidade e API) |
| `npm run test:e2e` | Playwright |
| `npm run format` | Prettier |

## Variáveis de ambiente

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — somente servidor, nunca expor ao cliente.
# QuizClaudeCode
