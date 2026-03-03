## Why

Com o dashboard de lista ao vivo pronto, ainda falta a visao operacional por viagem para acompanhar progresso e ETA de uma trip especifica. Esse gap impede concluir o item `S3-014` da Sprint 3.

## What Changes

- Adicionar rota de detalhe no `web-dashboard` em `/trips/:tripId`.
- Exibir snapshot inicial da trip (status, progresso, distancia restante e ETA) no carregamento da pagina.
- Consumir eventos realtime `trip.progress.v1` e `alert.event.v1` filtrados pela `tripId` para atualizacao ao vivo da tela de detalhe.
- Expor endpoint interno no dashboard para obter snapshot normalizado da trip a partir da API de backend.
- Adicionar testes unitarios e de integracao para parser/snapshot/rotas da tela de detalhe.

## Capabilities

### New Capabilities
- `tns-dashboard-trip-detail-progress`: Tela de detalhe por trip com progresso e ETA em tempo real.

### Modified Capabilities
- `tns-dashboard-trips-realtime`: Lista principal passa a referenciar a tela de detalhe por trip.

## Impact

- Codigo afetado:
  - `TNS/apps/web-dashboard/src/**`
  - `TNS/tests/unit/**`
  - `TNS/tests/integration/**`
  - `TNS/.env.example`
  - `TNS/Codex-TNS.md`
  - `docs/plan-change-log.md`
- APIs/protocolos:
  - Consumo de `GET /api/v1/trips/:tripId` (via endpoint interno do dashboard)
  - Consumo dos canais WS `trip.progress.v1` e `alert.event.v1`
