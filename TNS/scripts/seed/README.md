# seed

Scripts de carga inicial para dados de demonstracao.

## Seed de trips/stops demo (S2-004)

Comandos a partir da raiz `TNS`:

```bash
corepack pnpm seed:demo:trips:dry-run
corepack pnpm seed:demo:trips
```

O seed e idempotente: remove e recria as trips demo com IDs fixos para manter resultado reproduzivel em cada execucao.
