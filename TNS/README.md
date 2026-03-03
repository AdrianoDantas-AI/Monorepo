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

## Infra local (Docker)

```bash
corepack pnpm infra:up
corepack pnpm infra:logs
corepack pnpm infra:down
```

## Scripts raiz

- `corepack pnpm dev`
- `corepack pnpm build`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm verify`
- `corepack pnpm seed:demo:trips:dry-run`
- `corepack pnpm seed:demo:trips`
- `corepack pnpm infra:up`
- `corepack pnpm infra:down`
- `corepack pnpm infra:logs`

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
