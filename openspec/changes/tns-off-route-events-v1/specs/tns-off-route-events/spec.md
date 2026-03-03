## ADDED Requirements

### Requirement: System MUST emit versioned off-route transition events
O sistema MUST emitir eventos versionados para transições de desvio de rota.

#### Scenario: Suspected transition detected
- **WHEN** a state machine transitar de `normal` para `suspected`
- **THEN** o sistema MUST emitir `off_route.suspected.v1`.

#### Scenario: Confirmed transition detected
- **WHEN** a state machine confirmar desvio por pings ou duração
- **THEN** o sistema MUST emitir `off_route.confirmed.v1`.

#### Scenario: Back on route transition detected
- **WHEN** a state machine retornar para `normal` após estado suspeito/confirmado
- **THEN** o sistema MUST emitir `back_on_route.v1`.
