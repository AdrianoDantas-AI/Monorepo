## ADDED Requirements

### Requirement: API MUST expose machine-readable OpenAPI spec
O servico `api` MUST disponibilizar a especificacao OpenAPI em endpoint HTTP para consumo automatizado.

#### Scenario: OpenAPI spec available
- **WHEN** o cliente acessar `GET /openapi.json`
- **THEN** a API MUST retornar `200`
- **AND** o payload MUST conter `openapi: 3.0.3`
- **AND** o contrato MUST incluir os endpoints REST ativos de `trips`.

### Requirement: API MUST expose Swagger UI for human navigation
O servico `api` MUST disponibilizar pagina de documentacao navegavel para inspeção manual dos endpoints.

#### Scenario: Swagger UI available
- **WHEN** o cliente acessar `GET /docs`
- **THEN** a API MUST retornar `200`
- **AND** a resposta MUST ser `text/html`
- **AND** a pagina MUST apontar para `/openapi.json`.
