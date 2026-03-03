# OpenSpec no MonoRepo

Este diretorio centraliza o fluxo spec-driven do monorepo com OpenSpec.

## Estrutura

- `openspec/changes/`: propostas ativas e em andamento.
- `openspec/changes/archive/`: historico de mudancas concluidas e arquivadas.
- `openspec/specs/`: especificacoes consolidadas e vigentes.

## Fluxo operacional padrao

Pre-requisito recomendado:
```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

1. Propor mudanca:
```bash
openspec new change <nome-kebab-case>
```

2. Criar artefatos:
- `proposal.md` (por que)
- `design.md` (como)
- `specs/**/spec.md` (requisitos)
- `tasks.md` (implementacao)

3. Validar:
```bash
openspec validate --all
```

4. Implementar tasks e atualizar checkboxes.

5. Arquivar para consolidar spec:
```bash
openspec archive <nome-kebab-case> -y
```

## Integração com Codex

- Skills locais em `.codex/skills/openspec-*`.
- Fluxo recomendado:
  - `/opsx:propose "descricao da mudanca"`
  - `/opsx:apply <nome-da-mudanca>`
  - `/opsx:archive <nome-da-mudanca>`

## Guardrails locais

- Toda mudanca relevante de plano deve ser registrada em `docs/plan-change-log.md`.
- Todo erro/correcao relevante deve ser registrado em `docs/error-log.md`.
- Toda entrega precisa de testes `unit` e `integration` no ciclo da mudanca.
