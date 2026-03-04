## Why

A persistencia atual em Postgres usa um snapshot JSON unico do runtime store. Isso acelera bootstrap, mas dificulta evolucao, auditoria e consistencia transacional dos dados financeiros.

## What Changes

- Migrar persistencia Postgres para tabelas de dominio para `sessions`, `open_finance_connections` e `transactions`.
- Manter fallback em memoria para os demais agregados ainda nao modelados.
- Preservar contratos HTTP existentes e comportamento idempotente do webhook.
- Adicionar testes para resolver modo de persistencia e para endpoint operacional de modo ativo.

## Capabilities

### New Capabilities
- `consoledegastos-postgres-domain-persistence`

## Impact

- Reduz acoplamento do estado da API a um unico blob JSON.
- Prepara base para migracoes futuras de contas, categorias, faturas e recorrentes.
- Mantem fluxo atual do produto sem quebrar endpoints ja implementados.
