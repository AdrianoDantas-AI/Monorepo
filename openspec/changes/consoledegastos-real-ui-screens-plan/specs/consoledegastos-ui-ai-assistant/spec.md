## ADDED Requirements

### Requirement: IA assistant MUST be embedded as global and contextual UI experience
A UI MUST integrar assistente IA com chat global persistente e cards de insight por modulo.

#### Scenario: Global assistant drawer/panel
- **WHEN** o usuario abrir o assistente em qualquer tela
- **THEN** o sistema MUST manter historico da sessao e contexto da tela atual
- **AND** MUST permitir envio de mensagens em modo quick-insight e deep-analysis.

#### Scenario: Contextual insight cards per module
- **WHEN** o usuario acessar um modulo financeiro
- **THEN** o sistema MUST renderizar insights automaticos daquele contexto
- **AND** MUST permitir abrir recomendacoes acionaveis a partir do card.

### Requirement: IA actions MUST enforce preview and explicit confirmation in UI
A UI MUST bloquear execucao automatica de acoes sem confirmacao explicita do usuario.

#### Scenario: Preview before execution
- **WHEN** a IA sugerir acao de recategorizacao, limite, recorrente, alerta ou relatorio
- **THEN** o sistema MUST mostrar proposta detalhada em estado de preview
- **AND** MUST exigir confirmacao manual para executar.

#### Scenario: Execution status and audit visibility
- **WHEN** o usuario confirmar uma acao da IA
- **THEN** o sistema MUST mostrar status de execucao e resultado
- **AND** MUST permitir consultar historico da proposta e execucao.
