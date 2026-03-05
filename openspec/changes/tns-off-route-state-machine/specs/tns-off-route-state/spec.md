## ADDED Requirements

### Requirement: Off-route detection MUST implement explicit state transitions
O motor de detecção MUST operar com estados explícitos `normal`, `suspected`, `confirmed`.

#### Scenario: Transition to suspected
- **WHEN** uma amostra válida estiver fora do corredor do tier
- **THEN** o estado MUST transitar de `normal` para `suspected`.

#### Scenario: Transition to confirmed
- **WHEN** uma trip permanecer em suspeita
- **THEN** o estado MUST transitar para `confirmed` ao atingir mínimo de pings
- **OR** ao atingir duração mínima em suspeita.

### Requirement: Detector MUST return to normal when route is recovered
O estado MUST retornar para `normal` quando a amostra indicar que o veículo voltou ao corredor.

#### Scenario: Back on route
- **WHEN** o estado atual for `suspected` ou `confirmed` e a amostra estiver dentro do corredor
- **THEN** o estado MUST voltar para `normal`.
