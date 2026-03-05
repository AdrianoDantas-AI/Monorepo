## 1. Endpoint

- [x] 1.1 Criar `AlertRepository` com listagem filtrada.
- [x] 1.2 Implementar `GET /api/v1/alerts` no `app.ts`.
- [x] 1.3 Validar filtros `trip_id`, `severity` e `status` por query.

## 2. Contratos e documentação

- [x] 2.1 Definir `AlertDTO` e resposta de listagem em `packages/contracts`.
- [x] 2.2 Atualizar OpenAPI/Swagger com endpoint e schemas.

## 3. Testes e contexto

- [x] 3.1 Adicionar testes unitários para parser/repositório de alertas.
- [x] 3.2 Adicionar testes de integração do endpoint `/api/v1/alerts`.
- [x] 3.3 Atualizar `TNS/Codex-TNS.md` e `docs/plan-change-log.md`.
