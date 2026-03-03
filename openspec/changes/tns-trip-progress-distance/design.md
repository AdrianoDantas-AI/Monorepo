## Context

Com `route_plan` e cálculo geométrico de progresso já disponíveis, falta publicar esse progresso para trips ativas por endpoint HTTP.

## Decisions

1. **Endpoint dedicado de progresso**
- Expor `GET /api/v1/trips/:tripId/progress` com query obrigatória `lat` e `lng`.

2. **Regra de elegibilidade**
- Apenas trips `active` com `route_plan` válido podem calcular progresso.
- Demais casos retornam erro de domínio (`409`).

3. **Persistência incremental**
- Recalcular progresso no request e persistir em `route_track` para manter estado operacional atualizado.

4. **Resposta orientada a operação**
- Payload inclui `distance_done_m`, `distance_remaining_m`, `progress_pct`, `eta_s` e metadados de match de perna.

## Trade-offs

- O cálculo é request-driven via query (`lat`/`lng`) até a trilha de ingest/worker consolidar atualização contínua por eventos.
