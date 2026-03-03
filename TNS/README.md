# TNS - Route SaaS

Projeto base do TNS para tracking de frota, detecção de desvio e dashboard em tempo real.

## Stack base

- Node.js 20+
- TypeScript
- pnpm workspaces (via `corepack`)

## Bootstrap local

```bash
corepack pnpm install
corepack pnpm verify
```

## Scripts raiz

- `corepack pnpm dev`
- `corepack pnpm build`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm verify`

## Estrutura inicial

- `apps/web-dashboard`
- `services/api`
- `services/ingest`
- `services/realtime`
- `services/worker`
- `packages/contracts`
- `packages/shared`
- `infra/docker`
- `infra/terraform`
- `docs/ADR`
- `scripts/seed`
- `scripts/migrations`
