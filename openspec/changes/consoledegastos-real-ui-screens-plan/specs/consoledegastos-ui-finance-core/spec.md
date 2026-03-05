## ADDED Requirements

### Requirement: Core finance screens MUST be implemented as real interactive views
A UI web MUST implementar telas reais para Dashboard, Transacoes, Recorrentes, Fluxo de Caixa, Contas, Detalhes da Conta e Faturas.

#### Scenario: Dashboard real cards and lists
- **WHEN** o usuario acessar Visao Geral
- **THEN** o sistema MUST renderizar cards de ritmo de gastos, patrimonio, resultado parcial, categorias, faturas do mes, transacoes recentes e proximas despesas
- **AND** MUST suportar filtros de periodo e comparativos.

#### Scenario: Transactions real table operations
- **WHEN** o usuario acessar Transacoes
- **THEN** o sistema MUST permitir busca, filtros, paginacao, criacao manual e exportacao CSV
- **AND** MUST permitir acoes por linha como recategorizacao.

### Requirement: Accounts and invoices MUST expose detailed finance workflows
A UI MUST permitir gestao de contas/cartoes e leitura detalhada de faturas com navegacao contextual.

#### Scenario: Account detail drawer flow
- **WHEN** o usuario abrir detalhes de uma conta
- **THEN** o sistema MUST mostrar alias, numero mascarado, instituicao, saldo/limite e acao de editar alias
- **AND** MUST refletir alteracoes salvas sem inconsistencia visual.

#### Scenario: Invoice overview and drilldown
- **WHEN** o usuario acessar Faturas
- **THEN** o sistema MUST mostrar total mensal e breakdown de parcelas/recorrentes/avulsas
- **AND** MUST permitir navegar para transacoes vinculadas a cada fatura/cartao.
