## Context

O estado `suspected/confirmed` já foi implementado, porém o tratamento de ruído por GPS precisava de módulo próprio para evitar acoplamento.

## Decisions

1. **Módulo puro de classificação de accuracy**
- `off-route-accuracy-filter.ts` expõe `isAccuracyDegraded` e `classifyAccuracyForDetection`.

2. **Integração explícita com state machine**
- A state machine usa o classificador para decidir se deve ignorar transição no step atual.

3. **Validação por tier**
- Testes de integração validam comportamento com thresholds reais de `gold` e `bronze`.

## Trade-offs

- Pequena duplicação conceitual (threshold já presente na state machine), porém com ganho de clareza e reuso.
