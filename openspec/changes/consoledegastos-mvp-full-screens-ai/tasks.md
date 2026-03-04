## 1. Sprint 0 - Fundacao e Governanca

- [x] 1.1 Cadastrar projeto `ConsoleDeGastos` no `MONOREPO.md`.
- [x] 1.2 Criar pasta raiz isolada `ConsoleDeGastos/` com documento de entrada.
- [x] 1.3 Inicializar workspace (`apps`, `services`, `packages`, `tests`).
- [x] 1.4 Criar e preencher artefatos OpenSpec deste change.
- [x] 1.5 Configurar scripts `verify` com `unit` e `integration` obrigatorios.

## 2. Sprint 1 - Auth e Assistente IA base

- [x] 2.1 Implementar endpoints de auth (`google start/callback`, `magic-link`, `session`, `logout`).
- [x] 2.2 Implementar sessao de assistente IA (`/api/v1/ai/sessions`).
- [x] 2.3 Implementar mensagens do assistente (`/api/v1/ai/sessions/:id/messages`).
- [x] 2.4 Implementar insights por tela (`/api/v1/ai/insights`).

## 3. Sprint 2 - Open Finance Pluggy

- [x] 3.1 Implementar connect token e callback de conexao.
- [x] 3.2 Implementar status e sincronizacao de conexao.
- [x] 3.3 Implementar webhook idempotente de sync.

## 4. Sprint 3 - Modulos financeiros core

- [x] 4.1 Implementar dashboard, transacoes e filtros.
- [x] 4.2 Implementar recorrentes, fluxo de caixa e faturas.
- [x] 4.3 Implementar contas, drawer de detalhe e categorias.

## 5. Sprint 4 - Projecao, patrimonio e relatorios

- [x] 5.1 Implementar endpoint de projecao por cenario.
- [x] 5.2 Implementar endpoint de patrimonio consolidado.
- [x] 5.3 Implementar export e consulta de jobs de relatorio.

## 6. Sprint 5 - Acoes IA com confirmacao

- [x] 6.1 Implementar preview de acoes IA (`/api/v1/ai/actions/preview`).
- [x] 6.2 Implementar confirmacao obrigatoria (`/api/v1/ai/actions/:id/confirm`).
- [x] 6.3 Implementar consulta de proposta/execucao (`/api/v1/ai/actions/:id`).
- [x] 6.4 Implementar feedback da IA (`/api/v1/ai/feedback`).

## 7. Validacao e Fechamento

- [x] 7.1 Garantir testes `unit` e `integration` verdes no `verify`.
- [x] 7.2 Registrar mudanca de plano em `docs/plan-change-log.md`.
- [x] 7.3 Registrar erro relevante em `docs/error-log.md` quando houver.
- [x] 7.4 Rodar `openspec validate --all`.
