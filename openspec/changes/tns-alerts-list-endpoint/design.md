## Context

O sistema já possui eventos v1 de desvio, mas não expõe uma consulta HTTP para operação.

## Decisions

1. **Endpoint de leitura com filtros simples**
- `GET /api/v1/alerts` com filtros opcionais `trip_id`, `severity`, `status`.
- `x-tenant-id` obrigatório para isolamento multi-tenant.

2. **Repositório em memória para MVP**
- Introduzir `AlertRepository` com implementação `InMemoryAlertRepository`.
- Suporta listagem filtrada para testes e evolução futura para persistência real.

3. **Contrato explícito**
- Definir `AlertDTO` v1 + `AlertsListResponseDTO` em `packages/contracts`.

## Trade-offs

- Persistência em memória não é durável; suficiente para MVP de API e validação de contrato.
