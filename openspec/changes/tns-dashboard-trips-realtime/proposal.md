## Why

O projeto TNS ja possui canal realtime versionado para progresso de viagem e alertas, mas o `apps/web-dashboard` ainda esta como placeholder sem tela funcional. Isso bloqueia a entrega da Sprint 3 no item `S3-013` (lista de trips ao vivo).

## What Changes

- Implementar servidor HTTP do `web-dashboard` com rota principal `/` e `health`.
- Entregar tela de dashboard de trips com atualizacao em tempo real via WebSocket.
- Consumir eventos dos canais `trip.progress.v1` e `alert.event.v1` no browser para atualizar status operacional da lista.
- Exibir estado de conexao realtime e timestamp da ultima atualizacao por trip.
- Adicionar testes unitarios e de integracao para comportamento base do dashboard.

## Capabilities

### New Capabilities
- `tns-dashboard-trips-realtime`: Dashboard web com lista de trips em tempo real alimentada por canais WS versionados.

### Modified Capabilities
- Nenhuma.

## Impact

- Codigo afetado:
  - `TNS/apps/web-dashboard/src/**`
  - `TNS/tests/unit/**`
  - `TNS/tests/integration/**`
  - `TNS/Codex-TNS.md`
  - `docs/plan-change-log.md`
- APIs/protocolos:
  - Consumo de `ws://.../ws?channels=trip.progress.v1,alert.event.v1&tenant_id=...`
- Dependencias:
  - Nenhuma dependencia nova obrigatoria para frontend; uso de APIs WebSocket nativas no browser.
