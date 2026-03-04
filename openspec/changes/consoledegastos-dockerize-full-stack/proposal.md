## Why

Hoje apenas a infraestrutura (Postgres + Redis) esta em Docker. API/Web/Mobile ainda exigem execucao manual fora do compose.
Precisamos de um unico comando para subir toda a stack de desenvolvimento e facilitar validacao rapida do produto.

## What Changes

- Dockerizar API, Web e Mobile preview do ConsoleDeGastos.
- Expandir `infra/docker/compose.yml` para incluir todos os servicos do produto.
- Garantir healthchecks e dependencia entre servicos.
- Padronizar scripts `infra:*` para subir/derrubar stack completa com um comando.

## Capabilities

### New Capabilities
- `consoledegastos-dockerized-full-stack`

## Impact

- Ambiente local consistente com `1 comando`.
- Menor acoplamento com setup manual de terminal.
- Base pronta para evoluir para CI de container/preview.
