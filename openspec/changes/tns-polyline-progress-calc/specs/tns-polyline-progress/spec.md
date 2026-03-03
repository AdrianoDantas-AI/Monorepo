## ADDED Requirements

### Requirement: System MUST compute progress based on route polyline geometry
O cálculo de progresso MUST projetar a posição atual na geometria da rota para estimar progresso real.

#### Scenario: Position projected onto nearest route segment
- **WHEN** uma posição de veículo for avaliada contra o route plan
- **THEN** o sistema MUST identificar a perna mais próxima e a distância até a rota.

### Requirement: Progress output MUST expose operational distances and percentage
O resultado de progresso MUST incluir distâncias operacionais e percentual da rota.

#### Scenario: Progress payload generated
- **WHEN** o cálculo de progresso for executado
- **THEN** o payload MUST retornar `distance_done_m`, `distance_remaining_m` e `progress_pct`
- **AND** MUST incluir `matched_leg_id` e `matched_leg_index`.
