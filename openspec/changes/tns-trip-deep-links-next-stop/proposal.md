## Why

O fluxo da Sprint 2 já cria, otimiza e inicia trips, mas o motorista ainda não recebe um destino clicável para navegação externa. Precisamos gerar deep links por próxima parada para fechar a experiência operacional do MVP sem navegação embutida.

## What Changes

- Adicionar capacidade de gerar deep links Google Maps e Waze para a próxima parada da trip.
- Definir regras de seleção da próxima parada com base no estado da trip e ordem dos stops.
- Expor payload padronizado para consumo do app do motorista e APIs de operação.
- Cobrir regras com testes unit e integration.

## Capabilities

### New Capabilities
- `tns-trip-deep-links`: geração e entrega de links de navegação por próxima parada da trip, com fallback e validação de estado.

### Modified Capabilities
- Nenhuma.

## Impact

- Backend API (`TNS/services/api/src/http`) para geração de links.
- Contrato de resposta de trip/endpoint de link no domínio de viagens.
- Testes em `TNS/tests/unit` e `TNS/tests/integration`.
