## ADDED Requirements

### Requirement: Relatorios financeiros MUST be supported in ConsoleDeGastos MVP
O sistema MUST suportar relatorios financeiros conforme escopo aprovado do produto.

#### Scenario: Relatorios financeiros
- **WHEN** o usuario gerar relatorio
- **THEN** o sistema MUST criar job de export (csv/pdf)
- **AND** MUST permitir consulta de status do job.
