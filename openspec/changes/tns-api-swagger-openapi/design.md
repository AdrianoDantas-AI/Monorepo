## Context

A API do TNS roda em HTTP nativo (`node:http`) com roteamento manual em `app.ts`. Nao existe framework com Swagger embutido; portanto, a documentacao precisa ser servida diretamente pelo handler atual.

## Decisions

1. **Especificacao OpenAPI em modulo dedicado**
- `openapi.ts` centraliza contrato para evitar espalhamento.

2. **Swagger UI via CDN**
- Evita dependencia extra no lockfile e acelera bootstrap.
- `GET /docs` renderiza HTML com `swagger-ui-dist` remoto apontando para `/openapi.json`.

3. **Cobertura de testes**
- Unit: estrutura da spec + HTML.
- Integration: disponibilidade real de `/openapi.json` e `/docs`.

## Trade-offs

- Uso de CDN depende de internet para renderizar UI no browser.
- Em compensacao, o endpoint `/openapi.json` continua funcional offline e suficiente para tooling.
