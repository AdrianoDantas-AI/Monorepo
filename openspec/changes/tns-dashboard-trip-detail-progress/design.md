## Context

O `S3-013` entregou a lista de trips em tempo real, mas a operacao ainda nao tem uma pagina focada em uma trip individual. O `S3-014` exige detalhe de viagem com progresso e ETA em tempo real, reaproveitando os contratos de `S3-007` e os canais WS de `S3-012`.

## Goals / Non-Goals

**Goals:**
- Expor pagina `/trips/:tripId` no `web-dashboard`.
- Mostrar estado atual da trip com snapshot inicial + atualizacoes WS.
- Garantir visibilidade de progresso, ETA, distancia restante, ultimo alerta e estado de conexao.
- Cobrir com testes unit e integration.

**Non-Goals:**
- Mapa em tempo real (S3-016).
- Tela completa de alertas com filtros (S3-015).
- Persistencia de historico de eventos no dashboard.

## Decisions

1. Snapshot inicial via endpoint interno do dashboard
- Racional: evita problemas de CORS e centraliza tenant scoping no servidor do dashboard.
- Implementacao: `GET /api/trips/:tripId/snapshot` chama `GET /api/v1/trips/:tripId` na API principal.

2. Atualizacao ao vivo via WebSocket no browser
- Racional: manter o mesmo padrao de S3-013 com baixa latencia e sem polling agressivo.
- Regras: processar apenas eventos cuja `trip_id` seja igual ao parametro de rota.

3. Reuso do modelo de estado do dashboard
- Racional: manter parser/reducer/snapshot no mesmo modulo para reduzir divergencia entre lista e detalhe.

4. Configuracao por ambiente para API base URL
- Nova env: `WEB_DASHBOARD_API_BASE_URL` (default local: `http://127.0.0.1:3000`).

## Risks / Trade-offs

- [Risco] API principal indisponivel no carregamento da pagina.
  - Mitigacao: exibir erro de snapshot e manter tentativa de atualizacao por WS ativa.
- [Risco] Payload WS incompleto para uma trip.
  - Mitigacao: parser defensivo e manter ultimos valores validos.
- [Trade-off] Snapshot representa estado no momento da consulta.
  - Mitigacao: complementar rapidamente com stream realtime.

## Migration Plan

1. Implementar rota HTML de detalhe e endpoint interno de snapshot.
2. Implementar script de detalhe com merge de snapshot + eventos WS.
3. Atualizar testes unit/integration.
4. Atualizar documentacao de sprint e logs obrigatorios.
5. Validar com `openspec validate --all` e `corepack pnpm --dir TNS verify`.

## Open Questions

- Nenhuma bloqueante para o escopo de `S3-014`.
