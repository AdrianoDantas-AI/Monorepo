## ADDED Requirements

### Requirement: LegDTO MUST persist planned baseline metrics
Cada `leg` MUST incluir baseline explicito de distancia e ETA planejados para uso em comparacao futura.

#### Scenario: Route plan generation persists baseline
- **WHEN** uma trip tiver suas legs geradas no endpoint de otimizacao
- **THEN** cada `leg` MUST conter `baseline_distance_m` e `baseline_eta_s`
- **AND** os valores MUST refletir os planejados no momento da geracao da rota.

### Requirement: Contracts MUST expose baseline fields for legs
Os contratos publicos de `TripDTO/LegDTO` MUST incluir os campos de baseline de forma versionada.

#### Scenario: Contract validation
- **WHEN** um payload de `LegDTO` for validado
- **THEN** os campos `baseline_distance_m` e `baseline_eta_s` MUST ser obrigatorios
- **AND** snapshots de contrato MUST refletir os novos campos.
