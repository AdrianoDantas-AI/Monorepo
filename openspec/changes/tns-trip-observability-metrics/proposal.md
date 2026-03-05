## Why

Os endpoints de trips precisavam de rastreabilidade operacional (logs) e medicao objetiva de latencia para suportar a proxima fase de tracking em tempo real.

## What Changes

- Adicionar logs estruturados `trip_request` com `tenant_id` e `trip_id`.
- Adicionar agregacao de metricas HTTP por rota/metodo.
- Expor metricas em `GET /ops/metrics`.
- Cobrir observabilidade com testes unit e integration.

## Impact

- Time ganha visibilidade imediata de comportamento e desempenho dos endpoints de trips.
- Base pronta para alertas e tuning de performance nas sprints seguintes.
