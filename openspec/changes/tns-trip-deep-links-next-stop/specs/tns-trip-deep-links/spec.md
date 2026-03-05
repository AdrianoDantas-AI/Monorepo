## ADDED Requirements

### Requirement: API MUST provide next-stop deep links for active/planned trips
O sistema MUST expor um payload de deep links para a próxima parada de uma trip, incluindo links para Google Maps e Waze.

#### Scenario: Geracao bem-sucedida de deep links
- **WHEN** uma trip existente do tenant possuir próxima parada válida
- **THEN** a API MUST retornar links de `google_maps` e `waze` para a próxima parada
- **AND** o payload MUST incluir identificador da trip e da parada alvo

### Requirement: Next stop selection MUST be deterministic
A seleção da próxima parada MUST seguir regra determinística baseada na ordem dos stops e no estado/progresso da trip.

#### Scenario: Trip iniciada sem progresso concluído
- **WHEN** a trip estiver `active` e não houver conclusão da parada atual
- **THEN** a próxima parada MUST ser a primeira parada pendente por ordem

#### Scenario: Trip ainda não iniciada
- **WHEN** a trip estiver `planned`
- **THEN** a próxima parada MUST ser a primeira parada da sequência por ordem

### Requirement: Deep links endpoint MUST enforce tenant scoping
O endpoint de deep links MUST usar escopo por `x-tenant-id` e não pode revelar dados entre tenants.

#### Scenario: Tenant divergente
- **WHEN** o tenant informado não possuir a trip solicitada
- **THEN** a API MUST responder `404` sem expor metadados de outro tenant

### Requirement: API MUST return explicit domain errors for invalid link generation
Quando não houver dados suficientes para gerar link, a API MUST retornar erro explícito e orientativo.

#### Scenario: Trip sem próxima parada elegível
- **WHEN** não houver parada pendente para a trip
- **THEN** a API MUST responder erro de domínio (`400` ou `409`) com mensagem clara
