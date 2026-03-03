## 1. Rota e snapshot

- [x] 1.1 Adicionar rota HTML `/trips/:tripId` no `web-dashboard`.
- [x] 1.2 Adicionar endpoint interno `/api/trips/:tripId/snapshot` consultando `GET /api/v1/trips/:tripId`.
- [x] 1.3 Configurar `WEB_DASHBOARD_API_BASE_URL` no runtime e em `.env.example`.

## 2. UI de detalhe em tempo real

- [x] 2.1 Implementar HTML da tela de detalhe com status, progresso, ETA, distancia restante e ultimo alerta.
- [x] 2.2 Integrar snapshot inicial + stream WS filtrado por `trip_id`.
- [x] 2.3 Atualizar lista principal para linkar cada trip para `/trips/:tripId`.

## 3. Qualidade e governanca

- [x] 3.1 Adicionar testes unitarios para normalizacao de snapshot e merge de estado da trip.
- [x] 3.2 Adicionar teste de integracao para rota de detalhe e endpoint de snapshot.
- [x] 3.3 Atualizar `TNS/Codex-TNS.md` e `docs/plan-change-log.md` marcando `S3-014` concluido.
