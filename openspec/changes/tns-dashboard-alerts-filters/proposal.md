## Why

O backend ja possui `GET /api/v1/alerts` com filtros, mas a interface web ainda nao oferece uma tela dedicada para operar alertas. Isso bloqueia a conclusao do item `S3-015` da Sprint 3.

## What Changes

- Adicionar rota web `/alerts` no `web-dashboard`.
- Implementar UI com filtros basicos (`trip_id`, `severity`, `status`) e tabela de resultados.
- Adicionar endpoint interno `/api/alerts` que faz proxy para `GET /api/v1/alerts` com tenant scoping.
- Conectar navegacao basica entre lista de trips, detalhe da trip e tela de alertas.
- Incluir testes unit e integration para proxy e renderizacao principal da tela.

## Capabilities

### New Capabilities
- `tns-dashboard-alerts-filters`: Tela de alertas no dashboard com filtros operacionais basicos.

### Modified Capabilities
- `tns-dashboard-trips-realtime`: Navegacao principal passa a incluir atalho para a tela de alertas.
- `tns-dashboard-trip-detail-progress`: Tela de detalhe passa a incluir atalho para alertas.

## Impact

- Codigo afetado:
  - `TNS/apps/web-dashboard/src/**`
  - `TNS/tests/unit/**`
  - `TNS/tests/integration/**`
  - `TNS/Codex-TNS.md`
  - `docs/plan-change-log.md`
- APIs/protocolos:
  - Proxy `GET /api/alerts` -> `GET /api/v1/alerts`
