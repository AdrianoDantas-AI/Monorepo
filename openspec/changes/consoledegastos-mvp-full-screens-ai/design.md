## Context

O ConsoleDeGastos e um produto separado do TNS, com escopo financeiro pessoal e dependencia de Open Finance via Pluggy. O produto tambem exige um assistente IA no estilo de orquestracao por perfil/contexto, inspirado no modelo operacional do OpenClaw.

## Goals / Non-Goals

**Goals:**
- Isolar arquitetura e codigo em `ConsoleDeGastos/`.
- Cobrir modulos de telas financeiras definidos no plano.
- Disponibilizar assistente IA com insights por tela e fluxo `preview -> confirm -> execute`.
- Garantir `unit` + `integration` desde o inicio.

**Non-Goals:**
- Entregar toda experiencia visual final neste ciclo inicial.
- Implementar billing/paywall no MVP.
- Implementar multi-tenant B2B neste ciclo.

## Decisions

1. **Projeto isolado em pasta raiz propria**
- `ConsoleDeGastos/` com workspace proprio (`apps`, `services`, `packages`, `tests`).

2. **Backend inicial HTTP in-memory para acelerar bootstrap**
- Endpoints principais do plano ja disponiveis com store em memoria.
- Persistencia relacional entra em sprint posterior sem quebrar contratos v1.

3. **Assistente IA com confirmacao obrigatoria de acoes**
- Toda acao passa por proposta (`preview`) e confirmacao explicita (`confirm`).
- Execucao sem confirmacao e bloqueada por contrato.

4. **Contrato orientado por tela**
- Context builders por modulo (`dashboard`, `transactions`, `recurrents`, etc.).
- Insights automaticos por tela + chat global persistente.

5. **Autenticacao MVP**
- Google OAuth + Magic Link como metodos oficiais de login.

## Risks / Trade-offs

- **Risco:** bootstrap com store em memoria nao representa persistencia final.
  **Mitigacao:** contratos v1 estaveis e testes de integracao preservam comportamento ao migrar para DB.

- **Risco:** `openspec new change` sem scaffolding completo.
  **Mitigacao:** gerar artefatos manualmente no mesmo ciclo e registrar no `error-log`.

- **Risco:** aumento de escopo por multiplas telas + IA no MVP.
  **Mitigacao:** fatiar entrega por sprints no `tasks.md`.
