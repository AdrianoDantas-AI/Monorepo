## ADDED Requirements

### Requirement: Visao de faturas MUST be supported in ConsoleDeGastos MVP
O sistema MUST suportar visao de faturas conforme escopo aprovado do produto.

#### Scenario: Visao de faturas
- **WHEN** o usuario consultar faturas do mes
- **THEN** o sistema MUST retornar total e breakdown (parcelas, recorrentes, avulsas)
- **AND** MUST permitir acesso as transacoes da fatura.
