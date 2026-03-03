## 1. Servidor e UI base

- [x] 1.1 Implementar servidor HTTP real em `apps/web-dashboard` com rotas `/` e `/health`.
- [x] 1.2 Renderizar HTML da tela de trips com tabela, estado da conexao e ultimo update.
- [x] 1.3 Configurar variaveis de ambiente do dashboard (`WEB_DASHBOARD_PORT`, `WEB_DASHBOARD_TENANT_ID`, `WEB_DASHBOARD_REALTIME_WS_URL`).

## 2. Realtime e estado de tela

- [x] 2.1 Implementar parser/normalizador de eventos `trip.progress.v1` e `alert.event.v1`.
- [x] 2.2 Implementar reducer de estado de trips para atualizacao incremental ao vivo.
- [x] 2.3 Integrar cliente WebSocket no HTML para atualizar DOM em tempo real e exibir status da conexao.

## 3. Qualidade e governanca

- [x] 3.1 Adicionar testes unitarios para parser/reducer do dashboard.
- [x] 3.2 Adicionar teste de integracao para endpoints do `web-dashboard` e HTML de realtime.
- [x] 3.3 Atualizar `TNS/Codex-TNS.md` e `docs/plan-change-log.md` marcando `S3-013` concluido.
