## Context

Com o endpoint de progresso operacional, a sprint pede contrato final para manter compatibilidade com frontend e consumers.

## Decisions

1. **Contrato explícito v1**
- Introduzir `tripProgressDTOSchemaV1` e tipo `TripProgressDTO` no pacote de contratos.

2. **Validação por testes**
- Cobrir resposta do endpoint em teste de integração com validação Zod do contrato.

3. **Sem breaking change de rota**
- Manter `GET /api/v1/trips/:tripId/progress` sem alterar método/path; apenas formalizar shape.

## Trade-offs

- Contrato fica mais rígido, exigindo atualizações coordenadas em mudanças futuras do payload (vantagem: previsibilidade).
