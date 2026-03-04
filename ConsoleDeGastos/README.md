# ConsoleDeGastos

Produto financeiro com Web + App, Open Finance via Pluggy e Assistente IA contextual.

## Bootstrap

```bash
corepack pnpm --dir ConsoleDeGastos install
corepack pnpm --dir ConsoleDeGastos infra:up
corepack pnpm --dir ConsoleDeGastos verify
```

## Ambiente local

- PostgreSQL: `postgres://postgres:postgres@localhost:5432/consoledegastos`
- Redis: `redis://localhost:6379`

Use `ConsoleDeGastos/.env.example` como base para o `.env`.

## Scripts

- `corepack pnpm --dir ConsoleDeGastos dev`
- `corepack pnpm --dir ConsoleDeGastos infra:up`
- `corepack pnpm --dir ConsoleDeGastos infra:down`
- `corepack pnpm --dir ConsoleDeGastos infra:logs`
- `corepack pnpm --dir ConsoleDeGastos verify`
