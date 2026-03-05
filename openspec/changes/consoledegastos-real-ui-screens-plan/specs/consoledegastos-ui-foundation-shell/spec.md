## ADDED Requirements

### Requirement: Application shell MUST provide full product navigation and consistent layout
A aplicacao MUST oferecer shell real com sidebar, topbar, area de conteudo e navegacao para todos os modulos do MVP.

#### Scenario: Sidebar and route navigation
- **WHEN** o usuario abrir a aplicacao autenticado
- **THEN** o sistema MUST exibir sidebar com links de Visao Geral, Transacoes, Recorrentes, Fluxo de Caixa, Contas, Faturas, Categorias, Projecao, Patrimonio e Relatorios
- **AND** MUST navegar entre rotas sem quebrar estado global da sessao.

#### Scenario: Responsive layout behavior
- **WHEN** a largura da tela for mobile ou tablet
- **THEN** o shell MUST adaptar navegacao para drawer/menu compacto
- **AND** MUST manter acesso a todos os modulos sem overflow visual critico.

### Requirement: UI foundation MUST include reusable design tokens and base components
O frontend MUST manter tokens e componentes base compartilhados para garantir consistencia visual e manutencao.

#### Scenario: Shared tokens consumption
- **WHEN** componentes de botoes, cards, tabelas e badges forem renderizados
- **THEN** eles MUST consumir tokens unificados de cor, tipografia, espacamento e radius
- **AND** MUST evitar estilos hardcoded repetidos por pagina.

#### Scenario: Global states
- **WHEN** dados estiverem em loading, empty ou error
- **THEN** cada modulo MUST usar componentes base de estado
- **AND** MUST exibir acao de retry quando aplicavel.
