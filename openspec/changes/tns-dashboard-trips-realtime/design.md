## Context

O `services/realtime` agora publica eventos em `trip.progress.v1` e `alert.event.v1`, com scoping por `tenant_id`. O `apps/web-dashboard` ainda nao entrega interface real, o que impede validacao visual do fluxo realtime da Sprint 3.

## Goals / Non-Goals

**Goals:**
- Entregar pagina `/` do dashboard com lista de trips atualizada ao vivo via WS.
- Manter implementacao leve, sem framework adicional, para acelerar a entrega da Sprint 3.
- Expor `health` para operacao basica.
- Garantir cobertura com testes unit e integration.

**Non-Goals:**
- Implementar mapa (S3-016).
- Implementar pagina de detalhe de viagem (S3-014).
- Implementar tela dedicada de alertas com filtros (S3-015).
- Persistir estado do dashboard em banco.

## Decisions

1. Servidor HTTP nativo em Node no `web-dashboard`
- Racional: o projeto atual ja usa servicos HTTP nativos em outros pacotes, sem framework web frontend configurado.
- Alternativa considerada: adotar framework SPA/SSR agora.
- Motivo para nao adotar: aumentaria setup e desviaria da entrega incremental planejada.

2. Conexao WebSocket direta no browser para o `services/realtime`
- Racional: menor acoplamento e sem necessidade de proxy intermediario no `web-dashboard` para S3-013.
- Alternativa considerada: bridge server-side (dashboard recebe WS e redistribui via SSE).
- Motivo para nao adotar: maior complexidade operacional nesta etapa.

3. Estado de trips em memoria no cliente
- Racional: atender requisito de lista ao vivo com atualizacoes progressivas de `progress` e alertas.
- Alternativa considerada: polling de API.
- Motivo para nao adotar: polling nao entrega tempo real de forma nativa.

4. Configuracao por variaveis de ambiente
- `WEB_DASHBOARD_PORT` (porta do dashboard)
- `WEB_DASHBOARD_TENANT_ID` (tenant monitorado)
- `WEB_DASHBOARD_REALTIME_WS_URL` (endpoint WS base)
- Racional: simplificar execucao local e preparar ambiente para compose.

## Risks / Trade-offs

- [Risco] Browser sem suporte WS ou bloqueio de rede interna -> sem atualizacao ao vivo.
  - Mitigacao: exibir estado de conexao e mensagem de erro na UI.
- [Risco] Payload inesperado no canal WS.
  - Mitigacao: validacao defensiva no parser de mensagem no cliente.
- [Trade-off] Sem dados historicos na tela apos refresh.
  - Mitigacao: aceitavel para S3-013; historico pode entrar em sprint posterior.

## Migration Plan

1. Implementar servidor `web-dashboard` e HTML da tela.
2. Implementar cliente WS e estado em memoria no frontend.
3. Adicionar testes unit/integration.
4. Executar `openspec validate --all` e `corepack pnpm --dir TNS verify`.
5. Atualizar `TNS/Codex-TNS.md` e `docs/plan-change-log.md`.

## Open Questions

- Nenhuma bloqueante para S3-013.
