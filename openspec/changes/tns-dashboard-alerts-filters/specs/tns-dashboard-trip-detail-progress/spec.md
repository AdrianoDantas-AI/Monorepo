## MODIFIED Requirements

### Requirement: Tela de detalhe por trip
O sistema SHALL disponibilizar a tela de detalhe de trip com atalho para a operacao de alertas.

#### Scenario: Navegacao a partir do detalhe
- **WHEN** o operador acessar `/trips/{tripId}`
- **THEN** a pagina SHALL exibir link para `/alerts` mantendo navegacao consistente do dashboard
