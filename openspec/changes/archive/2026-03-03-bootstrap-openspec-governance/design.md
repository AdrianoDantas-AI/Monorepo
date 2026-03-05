## Context

O repositório `MonoRepo` já possui governança em `MONOREPO.md` e regras operacionais em `AGENTS.md`, com rastreabilidade em `docs/plan-change-log.md` e `docs/error-log.md`. A lacuna atual é um mecanismo estruturado para transformar intenção de mudança em requisitos verificáveis e tarefas rastreáveis.

## Goals / Non-Goals

**Goals:**
- Instituir OpenSpec como camada formal de especificação no monorepo.
- Padronizar criação e validação de artefatos de mudança antes da implementação.
- Integrar esse fluxo ao uso do Codex no repositório atual.

**Non-Goals:**
- Migrar retroativamente todo histórico antigo para OpenSpec.
- Alterar regras de branch protection, CI ou processo de review já existente.
- Substituir documentos centrais do monorepo; OpenSpec complementa esses artefatos.

## Decisions

1. **OpenSpec inicializado na raiz do monorepo**
- Racional: o escopo do repositório é multi-projeto; a governança de mudança deve ficar acima de cada pasta interna.
- Alternativa considerada: inicializar apenas dentro de `TNS`. Rejeitada para evitar duplicação de processo por projeto.

2. **Schema padrão `spec-driven`**
- Racional: é o fluxo nativo do OpenSpec para proposta, design, requisitos e tasks.
- Alternativa considerada: schema custom neste momento. Rejeitada para reduzir complexidade inicial.

3. **Codex como ferramenta habilitada via `openspec init --tools codex`**
- Racional: mantém integração direta com o agente já utilizado no repositório.
- Alternativa considerada: habilitar "all tools". Rejeitada para evitar ruído de instruções não usadas.

4. **Consolidar capability arquivando a mudança de bootstrap**
- Racional: publicar especificação efetiva em `openspec/specs` desde o início.
- Alternativa considerada: manter apenas em `changes/`. Rejeitada por deixar governança sem baseline consolidada.

## Risks / Trade-offs

- **Risco**: curva de adoção inicial do time no novo fluxo.
  **Mitigação**: `openspec/README.md` com passos mínimos e comandos diretos.

- **Risco**: ambiente Node abaixo do recomendado pelo pacote.
  **Mitigação**: manter registro em `error-log` e planejar upgrade de Node para versão suportada.

- **Risco**: duplicidade de fonte de verdade entre docs manuais e OpenSpec.
  **Mitigação**: manter OpenSpec como contrato de mudança e preservar docs centrais como governança operacional.
