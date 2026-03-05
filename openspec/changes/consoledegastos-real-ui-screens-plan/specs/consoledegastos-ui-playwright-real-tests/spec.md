## ADDED Requirements

### Requirement: Web journeys MUST be validated by real Playwright MCP suites
O ConsoleDeGastos web MUST executar validacao de jornadas criticas em ambiente dockerizado real usando MCP Playwright.

#### Scenario: Smoke on PR
- **WHEN** um PR alterar funcionalidades web do ConsoleDeGastos
- **THEN** a suite `smoke-pr` MUST rodar cobrindo login, dashboard, transacoes e open finance connect
- **AND** o merge MUST ser bloqueado se houver falha critica nessa suite.

#### Scenario: Full nightly suite
- **WHEN** a execucao `full-nightly` for acionada
- **THEN** a suite MUST cobrir fluxos completos (dashboard, transacoes, contas/faturas e IA preview->confirm)
- **AND** MUST incluir visual regression para telas-chave com baseline versionada.

#### Scenario: Evidence on failure
- **WHEN** um caso de teste Playwright falhar
- **THEN** o sistema MUST persistir artefatos de analise (trace, screenshot e logs relevantes)
- **AND** MUST produzir relatorio consolidado para triagem de falhas.
