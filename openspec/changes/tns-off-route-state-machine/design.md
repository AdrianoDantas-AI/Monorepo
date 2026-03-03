## Context

O planejamento de Sprint 3 exige transições explícitas entre `normal/suspeita/confirmado`, mas o código ainda não tinha um componente dedicado para essa regra.

## Decisions

1. **Módulo puro em `packages/shared`**
- `off-route-state-machine.ts` não depende de IO e recebe `sample + thresholds`.
- Facilita testes rápidos e reutilização por worker/ingest.

2. **Confirmação dupla**
- Confirma por:
  - quantidade mínima de pings fora do corredor, ou
  - duração mínima acumulada em suspeita.

3. **Tratamento de ruído por accuracy**
- Amostras com `accuracy_m` degradado não causam transição (são ignoradas no step).

## Trade-offs

- Estado é mantido em memória no chamador (snapshot imutável por step).
- Mantém o módulo simples para evolução posterior com persistência/event sourcing.
