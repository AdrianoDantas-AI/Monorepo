## ADDED Requirements

### Requirement: Tela de alertas com filtros basicos
O sistema SHALL disponibilizar uma tela de alertas em `/alerts` com filtros por `trip_id`, `severity` e `status`.

#### Scenario: Acesso da tela de alertas
- **WHEN** o operador acessar `/alerts`
- **THEN** o sistema SHALL renderizar formulario de filtros e lista de alertas

### Requirement: Proxy de alertas com tenant scoping
O dashboard SHALL expor `GET /api/alerts` e repassar os filtros para `GET /api/v1/alerts` usando `x-tenant-id`.

#### Scenario: Consulta com filtros
- **WHEN** o browser chamar `/api/alerts?severity=high&status=open`
- **THEN** o servidor SHALL consultar o backend com os mesmos filtros e retornar payload compatível com a UI

### Requirement: Renderizacao dos resultados
A tela SHALL exibir total e tabela com os campos principais do alerta.

#### Scenario: Alertas retornados
- **WHEN** a API retornar itens de alerta
- **THEN** a UI SHALL mostrar pelo menos `id`, `trip_id`, `severity`, `status` e `event`
