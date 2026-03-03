## Why

O monorepo cresceu com planejamento em Markdown manual, mas sem uma camada padronizada de especificacao formal de requisitos e mudancas. Precisamos de um fluxo unico e auditavel para proposta, design, requisitos e tarefas antes da implementacao.

## What Changes

- Adotar OpenSpec como workflow oficial spec-driven no repositorio raiz.
- Inicializar estrutura `openspec/` e skills locais em `.codex/skills/openspec-*`.
- Definir diretriz operacional para criar, validar e arquivar mudancas OpenSpec.
- Consolidar a capacidade de governanca OpenSpec para todo o monorepo.

## Capabilities

### New Capabilities
- `openspec-monorepo-governance`: padroniza o ciclo proposta -> design -> specs -> tasks -> arquivo para mudancas do monorepo.

### Modified Capabilities
- Nenhuma nesta mudanca inicial.

## Impact

- Processo de planejamento e execucao passa a exigir artefatos OpenSpec.
- Novos diretorios/versionamento em `openspec/` e `.codex/skills/`.
- Mudanca operacional para agentes e mantenedores ao iniciar trabalho de escopo relevante.
