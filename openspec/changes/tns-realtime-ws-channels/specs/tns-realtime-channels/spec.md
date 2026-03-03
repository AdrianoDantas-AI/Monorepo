## ADDED Requirements

### Requirement: Realtime service MUST expose versioned WebSocket channels
O serviço realtime MUST disponibilizar canais versionados para progresso e alertas.

#### Scenario: Client subscribes to trip progress channel
- **WHEN** cliente se conectar e assinar `trip.progress.v1`
- **THEN** o serviço MUST entregar eventos publicados nesse canal.

#### Scenario: Client subscribes to alert event channel
- **WHEN** cliente se conectar e assinar `alert.event.v1`
- **THEN** o serviço MUST entregar eventos publicados nesse canal.

### Requirement: Realtime publish MUST support tenant scoping
A publicação de eventos MUST respeitar escopo de tenant quando informado.

#### Scenario: Tenant-scoped publish
- **WHEN** um evento for publicado com `tenant_id`
- **THEN** apenas clientes do mesmo tenant MUST receber o evento.
