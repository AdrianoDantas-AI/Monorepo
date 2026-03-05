## ADDED Requirements

### Requirement: Trips endpoints MUST emit structured request logs
As rotas de `trips` MUST registrar logs estruturados com contexto minimo de tenant e viagem.

#### Scenario: Trip request log emitted
- **WHEN** uma rota de `trips` for processada
- **THEN** o sistema MUST emitir evento `trip_request`
- **AND** o evento MUST incluir `tenant_id`, `trip_id`, `route`, `status_code` e `latency_ms`.

### Requirement: API MUST expose latency metrics by route
A API MUST disponibilizar metricas agregadas por endpoint para diagnostico de desempenho.

#### Scenario: Metrics endpoint available
- **WHEN** o cliente acessar `GET /ops/metrics`
- **THEN** a API MUST retornar `200`
- **AND** o payload MUST incluir lista de rotas com `request_count`, `error_count`, `avg_latency_ms` e `max_latency_ms`.
