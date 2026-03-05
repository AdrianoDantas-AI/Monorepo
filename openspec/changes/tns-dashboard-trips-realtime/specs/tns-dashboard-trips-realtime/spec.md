## ADDED Requirements

### Requirement: Dashboard de trips em tempo real
O sistema SHALL disponibilizar uma tela web de dashboard com lista de trips e status operacional atualizado em tempo real.

#### Scenario: Acesso da tela principal
- **WHEN** um operador acessar `/` no `web-dashboard`
- **THEN** o sistema SHALL retornar uma pagina HTML com tabela/lista de trips e indicadores de conexao realtime

### Requirement: Assinatura de canais versionados de realtime
O cliente web SHALL assinar os canais `trip.progress.v1` e `alert.event.v1` com escopo por `tenant_id` para alimentar o dashboard.

#### Scenario: Inicializacao da conexao websocket
- **WHEN** a pagina do dashboard carregar
- **THEN** o cliente SHALL abrir conexao WebSocket para o endpoint configurado com `channels=trip.progress.v1,alert.event.v1` e `tenant_id` informado

### Requirement: Atualizacao ao vivo da lista de trips
O dashboard SHALL atualizar os dados visiveis da trip em memoria e na tela sempre que receber eventos validos dos canais assinados.

#### Scenario: Recebimento de progresso de viagem
- **WHEN** um evento `trip.progress.v1` valido for recebido
- **THEN** a linha da trip SHALL refletir progresso, distancia restante, ETA e horario da ultima atualizacao sem reload da pagina

#### Scenario: Recebimento de evento de alerta
- **WHEN** um evento `alert.event.v1` valido for recebido
- **THEN** a linha da trip SHALL refletir ultimo tipo de alerta recebido e atualizar timestamp de atividade

### Requirement: Resiliencia de conexao visivel na UI
O dashboard SHALL informar estado de conexao (`connecting`, `connected`, `disconnected`, `error`) para permitir operacao basica.

#### Scenario: Queda de conexao realtime
- **WHEN** a conexao WebSocket for encerrada ou falhar
- **THEN** a tela SHALL exibir estado nao conectado e manter os ultimos dados recebidos
