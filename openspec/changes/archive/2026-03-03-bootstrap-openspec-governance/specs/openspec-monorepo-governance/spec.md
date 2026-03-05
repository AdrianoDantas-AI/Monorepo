## ADDED Requirements

### Requirement: OpenSpec MUST govern relevant repository changes
Mudancas de escopo relevante no monorepo SHALL iniciar por uma change OpenSpec com artefatos de proposta, design, especificacao e tarefas antes da implementação.

#### Scenario: Criar mudanca OpenSpec para novo trabalho relevante
- **WHEN** um mantenedor iniciar uma mudanca de produto, arquitetura ou tooling com impacto real
- **THEN** uma pasta `openspec/changes/<nome-da-mudanca>/` MUST ser criada
- **AND** os artefatos `proposal.md`, `design.md`, `specs/**/spec.md` e `tasks.md` MUST existir e ser validaveis

### Requirement: OpenSpec artifacts MUST be validated before closing work cycle
Todo ciclo de mudanca OpenSpec SHALL executar validacao CLI para garantir consistencia estrutural dos artefatos.

#### Scenario: Validar artefatos de uma change
- **WHEN** os artefatos da change forem concluídos ou atualizados
- **THEN** o comando `openspec validate --all` MUST ser executado sem falhas

### Requirement: Consolidated specs MUST exist in openspec/specs
Mudancas OpenSpec concluidas SHALL ser arquivadas para consolidar requisitos vigentes em `openspec/specs`.

#### Scenario: Arquivar change concluida
- **WHEN** todas as tarefas da change estiverem finalizadas
- **THEN** o comando `openspec archive <change-name> -y` MUST mover a change para `openspec/changes/archive/`
- **AND** os requisitos consolidados MUST estar publicados em `openspec/specs/`

### Requirement: Codex integration MUST be provisioned for OpenSpec workflows
O repositório SHALL manter integração de OpenSpec com Codex para executar comandos de proposta, aplicação e arquivamento.

#### Scenario: Verificar integração de ferramentas para OpenSpec
- **WHEN** o OpenSpec for inicializado no repositório
- **THEN** a pasta `.codex/skills/openspec-*` MUST existir com skills de propose/apply/explore/archive
