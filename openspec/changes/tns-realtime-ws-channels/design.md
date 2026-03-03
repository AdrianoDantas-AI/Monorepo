## Context

O serviço `realtime` ainda só expõe `health` e não possui canais de streaming.

## Decisions

1. **Runtime WebSocket dedicado**
- Criar `realtime-server.ts` com `WebSocketServer`, gestão de assinaturas e publish em memória.

2. **Canais versionados**
- Suportar explicitamente:
  - `trip.progress.v1`
  - `alert.event.v1`

3. **Escopo por tenant**
- Conexão pode informar `tenant_id`; publish também pode informar `tenant_id` para entrega segmentada.

4. **Operabilidade**
- `GET /ops/channels` para diagnóstico básico.
- `POST /ops/publish` para simulação/publicação operacional local.

## Trade-offs

- Sem broker externo nesta etapa; pub/sub em memória atende ao MVP local Docker.
