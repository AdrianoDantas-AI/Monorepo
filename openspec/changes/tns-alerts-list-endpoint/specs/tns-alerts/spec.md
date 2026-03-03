## ADDED Requirements

### Requirement: API MUST list alerts scoped by tenant
O endpoint de alertas MUST exigir tenant e retornar apenas alertas do tenant informado.

#### Scenario: Tenant requests alert list
- **WHEN** `GET /api/v1/alerts` for chamado com `x-tenant-id`
- **THEN** a resposta MUST conter apenas alertas do tenant.

### Requirement: API MUST support alert filtering by trip, severity and status
O endpoint MUST aceitar filtros operacionais por query string.

#### Scenario: Alert list filtered
- **WHEN** `trip_id`, `severity` ou `status` forem informados
- **THEN** o sistema MUST aplicar todos os filtros informados no resultado.
