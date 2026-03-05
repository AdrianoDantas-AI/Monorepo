## ADDED Requirements

### Requirement: Conexao Open Finance via Pluggy MUST be supported in ConsoleDeGastos MVP
O sistema MUST suportar conexao open finance via pluggy conforme escopo aprovado do produto.

#### Scenario: Conexao Open Finance via Pluggy
- **WHEN** o usuario iniciar conexao de conta
- **THEN** o sistema MUST emitir connect token, receber callback e expor progresso ate sucesso
- **AND** MUST permitir retry em falha/cancelamento.
