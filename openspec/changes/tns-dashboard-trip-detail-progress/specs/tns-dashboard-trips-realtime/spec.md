## MODIFIED Requirements

### Requirement: Dashboard de trips em tempo real
O sistema SHALL disponibilizar uma tela web de dashboard com lista de trips e status operacional atualizado em tempo real, incluindo navegacao para detalhe por trip.

#### Scenario: Acesso da tela principal
- **WHEN** um operador acessar `/` no `web-dashboard`
- **THEN** o sistema SHALL retornar uma pagina HTML com tabela/lista de trips, indicadores de conexao realtime e links para `/trips/{tripId}`
