## ADDED Requirements

### Requirement: Strategic finance screens MUST provide actionable planning views
A UI web MUST implementar telas reais de Categorias, Projecao, Patrimonio e Relatorios com foco em analise e decisao.

#### Scenario: Categories budget control
- **WHEN** o usuario acessar Categorias
- **THEN** o sistema MUST suportar CRUD de categorias, limites mensais e indicadores de consumo
- **AND** MUST permitir recategorizacao de transacoes com feedback imediato.

#### Scenario: Forecast scenarios view
- **WHEN** o usuario acessar Projecao
- **THEN** o sistema MUST exibir cenarios base/otimista/conservador para 12 meses
- **AND** MUST explicar drivers principais e faixa de confianca.

### Requirement: Patrimony and reports MUST support trend analysis and exports
A UI MUST expor evolucao patrimonial e relatorios financeiros consumiveis pelo usuario final.

#### Scenario: Patrimony history and composition
- **WHEN** o usuario acessar Patrimonio
- **THEN** o sistema MUST mostrar patrimonio liquido, historico temporal e composicao de ativos/dividas
- **AND** MUST apresentar status de sincronizacao de investimentos.

#### Scenario: Reports generation and status
- **WHEN** o usuario solicitar export de relatorio
- **THEN** o sistema MUST iniciar job assincrono e mostrar status da geracao
- **AND** MUST permitir acesso ao historico de jobs e resultados disponiveis.
