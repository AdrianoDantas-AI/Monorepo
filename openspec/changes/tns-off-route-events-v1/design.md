## Context

Atualmente a state machine retorna apenas estado/razão de transição. Falta converter isso em eventos padronizados.

## Decisions

1. **Emissor puro em `packages/shared`**
- Criar função determinística que recebe contexto + sample + resultado da state machine e retorna evento v1 (ou `null`).

2. **Mapeamento de transições**
- `outside_corridor_detected` -> `off_route.suspected.v1`
- `confirmation_by_pings`/`confirmation_by_duration` -> `off_route.confirmed.v1`
- `back_on_route` -> `back_on_route.v1`

3. **Payload operacional mínimo**
- Incluir `tenant_id`, `trip_id`, `vehicle_id`, `ts` e `data` com `tier`, `distance_to_route_m`, `confidence` e `rule`.

## Trade-offs

- Emissão fica centralizada no utilitário de domínio; integração com fila/ws virá nas próximas tasks.
