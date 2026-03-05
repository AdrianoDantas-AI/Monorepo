## ADDED Requirements

### Requirement: Detection tiers MUST be centralized in a versioned config
O sistema MUST definir thresholds de detecção de `gold/silver/bronze` em configuração versionada e única.

#### Scenario: Versioned config available
- **WHEN** o contrato de configuração for carregado
- **THEN** ele MUST conter `version: "v1"`
- **AND** MUST incluir os três tiers (`gold`, `silver`, `bronze`).

### Requirement: Tier thresholds MUST expose detection primitives for runtime rules
Cada tier MUST expor thresholds necessários para regras de confirmação, anti-ruído e detour.

#### Scenario: Tier threshold fields present
- **WHEN** um tier for resolvido por nome
- **THEN** o payload MUST conter `ping_interval_s`, `corridor_m`, `confirm_min_pings`, `confirm_min_duration_s`, `degraded_accuracy_m`
- **AND** MUST conter thresholds de detour por tempo e distância.
