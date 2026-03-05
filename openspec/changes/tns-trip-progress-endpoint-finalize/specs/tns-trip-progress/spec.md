## ADDED Requirements

### Requirement: Progress endpoint response MUST have versioned DTO contract
A resposta de `GET /api/v1/trips/:tripId/progress` MUST seguir um schema versionado no pacote de contratos.

#### Scenario: Valid response payload
- **WHEN** o endpoint retornar sucesso (`200`)
- **THEN** o payload MUST validar em `TripProgressDTO` v1.

### Requirement: Contract tests MUST guard progress response regressions
O projeto MUST ter testes automatizados para evitar quebra de contrato no payload de progresso.

#### Scenario: Contract regression detection
- **WHEN** campos obrigatórios forem removidos ou mudarem tipo
- **THEN** os testes de contrato MUST falhar.
