## ADDED Requirements

### Requirement: Projecao financeira MUST be supported in ConsoleDeGastos MVP
O sistema MUST suportar projecao financeira conforme escopo aprovado do produto.

#### Scenario: Projecao financeira
- **WHEN** o usuario consultar projecao
- **THEN** o sistema MUST retornar cenarios base/otimista/conservador
- **AND** MUST trazer faixa de confianca.
