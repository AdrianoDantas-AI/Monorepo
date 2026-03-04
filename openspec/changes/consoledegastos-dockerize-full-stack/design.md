## Context

O workspace ja possui API funcional e stubs de Web/Mobile. Para inspeção rapida do produto, o ideal e ter um compose unico com todos os componentes principais em execucao.

## Goals / Non-Goals

**Goals:**
- Subir `postgres`, `redis`, `api`, `web` e `mobile-preview` com um comando.
- Expor portas padronizadas e healthchecks para diagnostico rapido.
- Manter fluxo de desenvolvimento atual (TypeScript + tsx) dentro dos containers.

**Non-Goals:**
- Build de producao otimizado.
- Publicacao em registry.
- Substituir stack de frontend por Next/Expo neste ciclo.

## Decisions

1. **Compose unico para stack completa**
- `infra/docker/compose.yml` passa a orquestrar backend, web preview e mobile preview.

2. **Web/Mobile preview como servidores leves**
- Criar servidores HTTP minimos para visualizacao e smoke da integracao com API.

3. **Scripts root orientados a 1 comando**
- `infra:up` com build embutido para garantir bootstrap sem passos extras.

## Risks / Trade-offs

- **Risco:** tempo inicial de `docker build` maior.
  **Mitigacao:** cache de camadas e dependencias no workspace.

- **Risco:** ambiente de preview nao representa frontend final.
  **Mitigacao:** declarar explicitamente como `preview` no compose e docs.
