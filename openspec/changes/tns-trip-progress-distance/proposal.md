## Why

A Sprint 3 precisa expor quilometragem percorrida/restante de trips ativas via API para suportar operação em tempo real.

## What Changes

- Adicionar endpoint `GET /api/v1/trips/:tripId/progress`.
- Calcular `distance_done_m` e `distance_remaining_m` com projeção da posição (`lat`/`lng`) na polyline planejada.
- Persistir `route_track` atualizado na trip ativa.
- Cobrir com testes unit e integration.

## Impact

- Entrega o critério de aceite do `S3-005`.
- Prepara base para `S3-006` (ETA dinâmico) e `S3-007` (endpoint finalizado).
