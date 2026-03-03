## ADDED Requirements

### Requirement: Progress endpoint MUST update ETA from current remaining distance
O endpoint de progresso MUST recalcular `eta_s` conforme a posição atual recebida.

#### Scenario: Vehicle advances along route
- **WHEN** duas leituras sucessivas de posição forem processadas com progresso crescente
- **THEN** o `eta_s` retornado MUST reduzir ou manter tendência de redução.

### Requirement: ETA calculation MUST remain available with safe fallback
O cálculo de ETA MUST continuar disponível mesmo com dados incompletos de duração planejada.

#### Scenario: Planned duration unavailable
- **WHEN** `total_duration_s` estiver ausente ou inválido
- **THEN** o sistema MUST aplicar fallback de velocidade e retornar `eta_s` numérico.
