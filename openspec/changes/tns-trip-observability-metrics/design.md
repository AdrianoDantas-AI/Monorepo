## Context

Com os endpoints de `trips` funcionais, faltava observabilidade minima de operacao: logs estruturados para auditoria de requests e metricas de latencia por endpoint.

## Decisions

1. **Modulo dedicado de observabilidade HTTP**
- `observability.ts` concentra logger estruturado e registry de metricas para manter o `app.ts` enxuto.

2. **Metrica agregada em memoria por metodo + rota canonica**
- Chaves com placeholders (`/api/v1/trips/{tripId}`) evitam cardinalidade alta.
- Exportacao via `/ops/metrics` em JSON para consumo local e CI smoke.

3. **Log estruturado orientado a viagem**
- Evento `trip_request` padronizado com `tenant_id`, `trip_id`, `route`, `status_code` e `latency_ms`.

## Trade-offs

- Registry em memoria reinicia junto com processo (adequado para MVP local).
- Em staging/prod, a interface permite evolucao para backend de metricas dedicado sem quebrar contrato HTTP.
