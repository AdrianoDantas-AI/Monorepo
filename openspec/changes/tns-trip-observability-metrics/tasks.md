## 1. Fluxo integrado

- [x] 1.1 Consolidar cobertura de integração do fluxo create -> optimize -> route_plan.
- [x] 1.2 Validar baseline por leg no payload do endpoint de otimização.

## 2. Logs estruturados

- [x] 2.1 Implementar evento de log `trip_request` com `tenant_id` e `trip_id`.
- [x] 2.2 Garantir emissão para rotas de `trips` no ciclo de request.

## 3. Métricas HTTP

- [x] 3.1 Implementar agregador em memória de latência por método/rota.
- [x] 3.2 Expor endpoint `GET /ops/metrics`.
- [x] 3.3 Cobrir com testes unit e integration.
