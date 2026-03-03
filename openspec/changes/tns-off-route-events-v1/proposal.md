## Why

A máquina de estado off-route já detecta transições, mas ainda não materializa eventos versionados para consumo operacional.

## What Changes

- Implementar emissor de eventos `off_route.suspected.v1`, `off_route.confirmed.v1` e `back_on_route.v1`.
- Mapear razões/transições da state machine para eventos de domínio.
- Cobrir emissão com testes unit e integração (sequência completa).

## Impact

- Fecha `S3-008`, `S3-009` e `S3-010`.
- Prepara base para `S3-011` (`GET /alerts`) e `S3-012` (canais WS).
