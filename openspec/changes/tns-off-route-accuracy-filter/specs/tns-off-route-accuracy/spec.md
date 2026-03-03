## ADDED Requirements

### Requirement: Detection MUST classify GPS accuracy before transition decisions
O sistema MUST classificar `accuracy_m` em `reliable` ou `degraded` antes de avaliar transições de estado.

#### Scenario: Degraded sample blocks transition
- **WHEN** `accuracy_m` estiver acima do threshold do tier
- **THEN** a decisão MUST marcar `should_ignore_transition = true`.

### Requirement: Accuracy filter MUST honor tier-specific thresholds
O filtro MUST respeitar thresholds de accuracy definidos por tier.

#### Scenario: Same sample, different tier decisions
- **WHEN** a mesma amostra for avaliada com tiers diferentes
- **THEN** o resultado MUST poder divergir conforme `degraded_accuracy_m` de cada tier.
