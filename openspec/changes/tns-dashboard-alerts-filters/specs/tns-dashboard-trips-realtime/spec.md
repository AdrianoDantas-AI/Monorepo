## MODIFIED Requirements

### Requirement: Dashboard de trips em tempo real
O sistema SHALL disponibilizar a tela de lista de trips em tempo real com navegacao operacional para detalhes de trip e para a tela de alertas.

#### Scenario: Navegacao a partir da lista
- **WHEN** o operador visualizar a tela `/`
- **THEN** a pagina SHALL exibir link para `/alerts` e links de detalhe por trip em `/trips/{tripId}`
