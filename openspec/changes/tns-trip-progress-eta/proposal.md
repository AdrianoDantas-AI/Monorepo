## Why

Após expor progresso de distância (`S3-005`), falta atualizar ETA de forma dinâmica a cada posição recebida.

## What Changes

- Evoluir o cálculo de progresso para estimar `eta_s` com base em distância restante e velocidade média planejada.
- Retornar `eta_s` recalculado em `GET /api/v1/trips/:tripId/progress`.
- Cobrir com testes unit e integration.

## Impact

- Entrega o critério de aceite do `S3-006`.
- Deixa o endpoint de progresso mais próximo da finalização esperada no `S3-007`.
