# consoledegastos-postgres-domain-persistence Specification

## Purpose
TBD - created by archiving change consoledegastos-postgres-domain-persistence. Update Purpose after archive.
## Requirements
### Requirement: Postgres MUST persist core domain entities in dedicated tables
Quando `PERSISTENCE_MODE=postgres`, a API MUST persistir entidades centrais em tabelas dedicadas para suportar evolucao incremental sem depender de um unico blob JSON.

#### Scenario: Persistencia e reconstrucao de estado
- **WHEN** o servidor iniciar em modo postgres
- **THEN** o runtime MUST ser reconstruido a partir das tabelas `sessions`, `open_finance_connections` e `transactions`
- **AND** campos ainda nao modelados MUST ser carregados de snapshot auxiliar sem sobrescrever os agregados modelados.

#### Scenario: Escrita consistente por mutacao
- **WHEN** uma mutacao de API alterar sessoes, conexoes open finance ou transacoes
- **THEN** o adapter MUST persistir os agregados modelados em transacao unica
- **AND** MUST manter idempotencia de webhook e contratos HTTP existentes.

