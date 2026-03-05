## ADDED Requirements

### Requirement: Open Finance connect flow MUST provide complete Pluggy access UX
A UI MUST implementar fluxo completo de acesso Open Finance com modal Pluggy e estados de progresso/sucesso/falha.

#### Scenario: Connect account success flow
- **WHEN** o usuario clicar em conectar conta e concluir autenticacao da instituicao
- **THEN** o sistema MUST mostrar progresso percentual ate 100%
- **AND** MUST refletir conexao ativa nas telas de Contas e Dashboard apos sync.

#### Scenario: Error and retry flow
- **WHEN** ocorrer erro de autenticacao, timeout ou cancelamento
- **THEN** o sistema MUST mostrar mensagem clara de erro
- **AND** MUST oferecer acao de retry sem exigir recarga manual da pagina.

### Requirement: Consent and sync state MUST be visible in UI
A UI MUST expor estado de consentimento e sincronizacao para transparencia do usuario.

#### Scenario: Consent management visibility
- **WHEN** a conexao for finalizada com sucesso
- **THEN** o sistema MUST exibir link de gestao de consentimento Pluggy
- **AND** MUST mostrar status de sincronizacao por instituicao.

#### Scenario: Institution instability banner
- **WHEN** uma instituicao estiver instavel ou com falha de sync
- **THEN** o sistema MUST destacar banner de instabilidade na tela de Contas
- **AND** MUST indicar impacto nas conexoes afetadas.
