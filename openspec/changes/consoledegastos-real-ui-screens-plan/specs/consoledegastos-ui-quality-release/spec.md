## ADDED Requirements

### Requirement: UI implementation MUST meet release quality gates for MVP
A entrega das telas reais MUST cumprir gates tecnicos de qualidade antes do release MVP.

#### Scenario: Frontend test gates
- **WHEN** uma release candidate de UI for preparada
- **THEN** o sistema MUST passar testes unit, integration e e2e das jornadas criticas
- **AND** MUST nao ter regressao bloqueante em fluxos de login, openfinance, dashboard e transacoes.

#### Scenario: Accessibility and performance baseline
- **WHEN** os modulos principais forem validados
- **THEN** o sistema MUST atender baseline minima de acessibilidade (teclado, foco, contraste, labels)
- **AND** MUST cumprir baseline de performance definida para carregamento inicial e interacoes principais.

### Requirement: MCP Playwright real tests MUST gate web release readiness
O ciclo de release web MUST incluir sprint dedicada de validacao real com MCP Playwright, cobrindo fluxos funcionais e regressao visual.

#### Scenario: PR smoke gate
- **WHEN** um PR alterar UI web ou fluxos criticos
- **THEN** o sistema MUST executar suite `smoke-pr` do Playwright MCP
- **AND** MUST bloquear merge em falha critica de smoke.

#### Scenario: Full nightly functional + visual
- **WHEN** a rotina diaria de QA for executada
- **THEN** o sistema MUST executar suite `full-nightly` com fluxos funcionais completos e visual regression
- **AND** MUST publicar relatorio consolidado de pass rate, diffs visuais e falhas criticas.

#### Scenario: Failure evidence and triage
- **WHEN** qualquer teste Playwright falhar
- **THEN** o sistema MUST coletar evidencia minima (trace, screenshot e logs de console/network)
- **AND** MUST registrar item de triagem com causa provavel e status de correcao.

### Requirement: Release process MUST include rollout checklist and rollback readiness
O release da UI MUST seguir checklist operacional com criterios claros de go/no-go.

#### Scenario: MVP release checklist
- **WHEN** o time iniciar corte de release
- **THEN** o sistema MUST validar checklist de observabilidade, logs de erro e monitoramento de UX
- **AND** MUST registrar plano de rollback para regressao critica.

#### Scenario: Post-release validation
- **WHEN** a release for publicada em ambiente alvo
- **THEN** o sistema MUST executar smoke das telas principais
- **AND** MUST registrar evidencias de funcionamento para encerramento do ciclo.
