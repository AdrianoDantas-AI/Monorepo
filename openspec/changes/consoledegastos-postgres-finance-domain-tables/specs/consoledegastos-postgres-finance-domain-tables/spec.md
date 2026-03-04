## ADDED Requirements

### Requirement: Postgres MUST persist core finance aggregates in dedicated tables
Quando em modo postgres, a API MUST persistir agregados financeiros principais em tabelas dedicadas para garantir consistencia entre reinicios e evolucao por modulo.

#### Scenario: Reconstrucao de contas e faturas
- **WHEN** o servidor iniciar com persistencia postgres
- **THEN** `accounts` e `invoices` MUST ser carregados de tabelas dedicadas
- **AND** MUST manter formato de resposta atual dos endpoints.

#### Scenario: Reconstrucao de categorias e recorrentes
- **WHEN** o servidor iniciar com persistencia postgres
- **THEN** `categories` e `recurrents` MUST ser carregados de tabelas dedicadas
- **AND** alteracoes via endpoints PATCH/POST MUST persistir apos reinicio.

#### Scenario: Compatibilidade com snapshot auxiliar
- **WHEN** houver agregados nao modelados
- **THEN** o sistema MUST continuar usando snapshot auxiliar apenas para esses campos
- **AND** MUST nao sobrescrever dados tabulares modelados durante load/save.
