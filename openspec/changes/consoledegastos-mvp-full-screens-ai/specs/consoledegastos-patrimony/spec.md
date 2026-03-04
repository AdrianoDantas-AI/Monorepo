## ADDED Requirements

### Requirement: Patrimonio consolidado MUST be supported in ConsoleDeGastos MVP
O sistema MUST suportar patrimonio consolidado conforme escopo aprovado do produto.

#### Scenario: Patrimonio consolidado
- **WHEN** o usuario consultar patrimonio
- **THEN** o sistema MUST retornar patrimonio liquido, ativos e dividas
- **AND** MUST suportar historico temporal.
