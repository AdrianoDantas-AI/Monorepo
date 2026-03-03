## Why

Após emitir eventos de desvio, falta endpoint para listar alertas com filtros operacionais.

## What Changes

- Adicionar `GET /api/v1/alerts`.
- Implementar filtros por `trip_id`, `severity` e `status`, com escopo obrigatório por `x-tenant-id`.
- Definir contrato de resposta para lista de alertas.
- Atualizar OpenAPI/Swagger e testes unit/integration.

## Impact

- Entrega `S3-011` (lista de alertas funcional).
- Prepara base para `S3-012` (stream WS) e `S3-015` (tela de alertas).
