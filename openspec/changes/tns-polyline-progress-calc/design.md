## Context

Com `route_plan` e `legs` já persistidos, faltava um cálculo de progresso que usasse a geometria da rota em vez de estimativas fixas.

## Decisions

1. **Utilitário puro em `packages/shared`**
- `polyline-progress.ts` sem IO, com API determinística para testes.

2. **Projeção ponto-segmento**
- Para cada segmento da polyline, projeta posição atual e escolhe menor distância à rota.
- Usa razão de progresso no segmento para converter em progresso da leg.

3. **Resultado orientado a runtime**
- Retorna:
  - `matched_leg_index`/`matched_leg_id`,
  - `distance_to_route_m`,
  - `distance_done_m`/`distance_remaining_m`,
  - `progress_pct`.

## Trade-offs

- Formato de polyline atual é mock (`lat,lng;lat,lng`), mas a estrutura suporta evolução futura para polyline real codificada.
