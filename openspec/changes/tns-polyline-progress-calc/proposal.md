## Why

As próximas APIs de progresso (`S3-005+`) dependem de cálculo geométrico real sobre a rota planejada.

## What Changes

- Implementar utilitário de progresso sobre polyline.
- Decodificar polyline mock e projetar posição atual no segmento mais próximo.
- Retornar `distance_done_m`, `distance_remaining_m`, `progress_pct` e leg casada.
- Cobrir com testes unit e integration.

## Impact

- Cálculo de progresso deixa de ser aproximado/manual.
- Cria base para ETA dinâmico e endpoint de progresso da trip.
