## Why

Para reduzir falso positivo, a decisão por `accuracy_m` precisa estar explícita e reutilizável fora da state machine.

## What Changes

- Criar filtro dedicado para classificar amostras como `reliable` ou `degraded`.
- Integrar o filtro ao motor de estado off-route.
- Cobrir o comportamento com testes unit e integration por tier.

## Impact

- Regras de anti-ruído ficam desacopladas do motor de transição.
- Facilita reutilização em ingest e workers nas próximas etapas.
