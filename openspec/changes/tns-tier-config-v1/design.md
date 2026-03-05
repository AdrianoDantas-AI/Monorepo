## Context

Até este ponto, os tiers estavam descritos no `Codex-TNS.md`, mas sem representação técnica versionada no código.

## Decisions

1. **Configuração em `@tns/contracts`**
- `detection-tier-config.ts` concentra schema, tipo e defaults (`v1`) em um ponto compartilhável.

2. **Versionamento explícito**
- Campo `version: "v1"` no contrato para permitir evolução sem quebra futura.

3. **Thresholds por tier**
- Inclui parâmetros essenciais para próximas regras:
  - `ping_interval_s`, `corridor_m`,
  - `confirm_min_pings`, `confirm_min_duration_s`,
  - `degraded_accuracy_m`,
  - thresholds de detour tempo/distância.

## Trade-offs

- O contrato inicial é mais amplo que o uso imediato.
- Em troca, evita retrabalho nos próximos itens da Sprint 3.
