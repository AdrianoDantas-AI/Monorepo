## ADDED Requirements

### Requirement: Tela de detalhe por trip
O sistema SHALL disponibilizar uma tela de detalhe acessivel em `/trips/{tripId}` para acompanhamento operacional da viagem.

#### Scenario: Abertura da tela de detalhe
- **WHEN** o operador navegar para `/trips/trip_001`
- **THEN** o sistema SHALL renderizar pagina HTML contendo identificador da trip, status, progresso, ETA e distancia restante

### Requirement: Snapshot inicial da trip
O dashboard SHALL buscar snapshot inicial da trip via endpoint interno e exibir os dados antes do primeiro evento WS.

#### Scenario: Snapshot carregado com sucesso
- **WHEN** a tela de detalhe for carregada e a API responder `200`
- **THEN** a pagina SHALL exibir o estado inicial de status/progresso/ETA/distancia restante da trip

#### Scenario: Snapshot indisponivel
- **WHEN** a consulta inicial de snapshot falhar
- **THEN** a pagina SHALL exibir estado de erro de snapshot sem interromper a conexao realtime

### Requirement: Atualizacao realtime filtrada por trip
A tela de detalhe SHALL processar apenas eventos de `trip.progress.v1` e `alert.event.v1` cujo `trip_id` corresponda ao da rota.

#### Scenario: Evento de outra trip recebido
- **WHEN** a conexao WS receber evento com `trip_id` diferente da tela atual
- **THEN** a pagina SHALL ignorar o evento e manter o estado da trip atual

#### Scenario: Evento valido da trip atual recebido
- **WHEN** a conexao WS receber evento valido da mesma trip
- **THEN** a pagina SHALL atualizar imediatamente os dados de progresso/ETA/alerta sem reload
