## Why

A persistencia Postgres ja cobre `sessions`, `open_finance_connections` e `transactions`, mas os modulos financeiros principais ainda dependem de snapshot auxiliar para `accounts`, `categories`, `invoices` e `recurrents`.

## What Changes

- Migrar `accounts`, `categories`, `invoices` e `recurrents` para tabelas dedicadas no adapter Postgres.
- Ajustar `load()` e `save()` para usar essas tabelas como fonte de verdade.
- Manter compatibilidade dos endpoints v1 e fallback memory.
- Adicionar testes de persistencia para os novos agregados modelados.

## Capabilities

### New Capabilities
- `consoledegastos-postgres-finance-domain-tables`

## Impact

- Reduz ainda mais dependencia do snapshot JSON.
- Facilita evolucao de regras por modulo financeiro.
- Prepara terreno para migracao final dos agregados restantes (IA sessions/proposals/executions, alerts e feedbacks).
