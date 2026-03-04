## Context

O backend do `ConsoleDeGastos` roda com um `RuntimeStore` em memoria e sincroniza esse estado para Postgres via um registro JSON unico. Com o crescimento de features (sync Pluggy, IA, filtros e exportacoes), precisamos de persistencia por entidade para garantir evolucao segura.

## Goals / Non-Goals

**Goals:**
- Persistir `sessions`, `open_finance_connections` e `transactions` em tabelas dedicadas no Postgres.
- Manter compatibilidade com o `RuntimeStore` atual da API.
- Preservar `PERSISTENCE_MODE=memory` para testes e desenvolvimento rapido.

**Non-Goals:**
- Migrar todos os agregados financeiros neste ciclo.
- Introduzir ORM/migrations complexas.
- Alterar contratos publicos dos endpoints v1.

## Decisions

1. **Persistencia hibrida no adapter Postgres**
- Tabelas dedicadas para entidades criticas (`sessions`, `connections`, `transactions`).
- Snapshot JSON mantido apenas para agregados ainda nao modelados.

2. **Fonte de verdade por tabela para agregados modelados**
- `load()` reconstrui o `RuntimeStore` lendo tabelas normalizadas e complementando com defaults.
- `save()` faz `upsert` por linha para os agregados modelados e atualiza snapshot auxiliar dos nao modelados.

3. **Compatibilidade operacional preservada**
- Nenhuma mudanca em rotas HTTP.
- Endpoint `/ops/persistence` continua indicando modo ativo.

## Risks / Trade-offs

- **Risco:** escrita por lotes pode ter custo maior por request.
  **Mitigacao:** usar `BEGIN/COMMIT` e `upsert` em lote por entidade.

- **Risco:** divergencia entre tabelas e snapshot auxiliar.
  **Mitigacao:** snapshot conter apenas campos nao modelados e ser atualizado na mesma transacao.

- **Risco:** schema criado dinamicamente em runtime.
  **Mitigacao:** `CREATE TABLE IF NOT EXISTS` idempotente e cobertura de testes de modo.
