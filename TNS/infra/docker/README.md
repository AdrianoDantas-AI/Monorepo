# docker

Infra Docker local do projeto TNS.

## Compose

- Arquivo: `infra/docker/compose.yml`
- Servicos: `postgres-postgis`, `redis`, `api`, `ingest`, `realtime`, `worker`

## Uso

```bash
corepack pnpm infra:up
corepack pnpm infra:logs
corepack pnpm infra:down
```

## Healthchecks

- `postgres-postgis`: `pg_isready`
- `redis`: `redis-cli ping`
- `api/ingest/realtime/worker`: `GET /health` em cada porta do servico
