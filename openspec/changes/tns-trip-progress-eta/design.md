## Context

O endpoint de progresso já atualiza distância percorrida/restante, mas ainda usa ETA estático da rota inicial.

## Decisions

1. **ETA por velocidade média planejada**
- Calcular `eta_s` como `distance_remaining_m / avg_speed_mps`.
- `avg_speed_mps` deriva de `route_plan.total_distance_m / route_plan.total_duration_s`.

2. **Fallback seguro**
- Se os dados de duração/distância planejada forem inválidos, aplicar velocidade default para evitar `eta_s` nulo.

3. **Atualização por request**
- Cada chamada em `/progress` recalcula `eta_s` de acordo com a posição informada.

## Trade-offs

- ETA é aproximado por velocidade média global da rota (não por trânsito real), mas suficiente para o MVP.
