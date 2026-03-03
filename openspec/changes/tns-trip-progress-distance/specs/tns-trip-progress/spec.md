## ADDED Requirements

### Requirement: API MUST expose progress distances for active trips
O sistema MUST expor cálculo de progresso para trips ativas via endpoint dedicado.

#### Scenario: Progress queried for an active trip
- **WHEN** `GET /api/v1/trips/:tripId/progress?lat={lat}&lng={lng}` for executado com tenant válido
- **THEN** a resposta MUST incluir `distance_done_m`, `distance_remaining_m` e `progress_pct`.

### Requirement: Progress calculation MUST be based on planned route geometry
O cálculo MUST projetar a posição na rota planejada para obter distância percorrida/restante.

#### Scenario: Position projected over route legs
- **WHEN** o endpoint receber `lat`/`lng` válidos
- **THEN** o sistema MUST calcular progresso com base na geometria das legs
- **AND** MUST persistir `route_track` atualizado na trip.
