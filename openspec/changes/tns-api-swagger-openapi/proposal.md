## Why

Os endpoints REST do `services/api` estavam sem documentação OpenAPI publicada, dificultando onboarding, validação de contratos e consumo por clientes.

## What Changes

- Publicar especificação OpenAPI em `GET /openapi.json`.
- Publicar interface Swagger UI em `GET /docs`.
- Documentar os endpoints REST atuais de health, ops e trips.
- Cobrir a documentação com testes unit e integration.

## Impact

- API passa a oferecer documentação interativa e contrato exportável.
- Reduz ambiguidade de payload/headers/status codes para equipe e automações.
