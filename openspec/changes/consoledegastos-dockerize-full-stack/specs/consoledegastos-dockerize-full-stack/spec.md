## ADDED Requirements

### Requirement: ConsoleDeGastos stack MUST be runnable with one compose command
A stack local MUST permitir subir componentes principais do produto com um comando unico.

#### Scenario: Stack completa em execucao
- **WHEN** o desenvolvedor executar `corepack pnpm --dir ConsoleDeGastos infra:up`
- **THEN** `postgres`, `redis`, `api`, `web` e `mobile-preview` MUST iniciar
- **AND** cada servico MUST disponibilizar endpoint de `health`.

#### Scenario: API com persistencia postgres no compose
- **WHEN** a API iniciar via compose
- **THEN** ela MUST usar `PERSISTENCE_MODE=postgres`
- **AND** MUST conectar no `DATABASE_URL` interno do container postgres.

#### Scenario: Preview clients integrados com API
- **WHEN** `web` e `mobile-preview` estiverem em execucao
- **THEN** ambos MUST consumir status da API configurada por `API_BASE_URL`
- **AND** MUST expor uma pagina/endpoint para inspeção manual.
