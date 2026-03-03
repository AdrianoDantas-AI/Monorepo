## Context

`S3-011` entregou o endpoint de listagem de alertas com filtros por tenant/trip/severidade/status. O dashboard ainda nao consome esse endpoint em uma tela dedicada, mantendo a operacao de alertas sem suporte visual no produto web.

## Goals / Non-Goals

**Goals:**
- Expor rota `/alerts` no `web-dashboard`.
- Permitir filtros basicos de alertas (`trip_id`, `severity`, `status`) via URL/query string.
- Mostrar lista de alertas com total e campos essenciais.
- Cobrir proxy e tela com testes unit/integration.

**Non-Goals:**
- Workflow de ack/resolucao de alerta.
- Paginacao e ordenacao avancadas.
- Realtime push de alertas na tela (pode evoluir em sprint seguinte).

## Decisions

1. Proxy server-side para alertas
- `GET /api/alerts` no dashboard encaminha para `GET /api/v1/alerts`.
- Mantem tenant scoping no servidor e evita CORS no browser.

2. Filtros refletidos em query string
- A tela usa parametros da URL para facilitar compartilhamento de estado e refresh idempotente.

3. UI sem framework adicional
- Manter padrao atual (HTML + JS nativo) para entrega incremental da Sprint 3.

## Risks / Trade-offs

- [Risco] API principal indisponivel.
  - Mitigacao: exibir erro claro no painel de alertas.
- [Trade-off] Sem paginacao para alto volume.
  - Mitigacao: suficiente para MVP da sprint; evolucao posterior com paginação.

## Migration Plan

1. Criar HTML da tela de alertas e rota `/alerts`.
2. Criar endpoint proxy `/api/alerts`.
3. Ajustar navegacao entre telas.
4. Adicionar testes unit/integration.
5. Validar com `openspec validate --all` e `corepack pnpm --dir TNS verify`.

## Open Questions

- Nenhuma bloqueante para o escopo de `S3-015`.
