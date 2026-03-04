## 1. Sprint 0 - Fundacao e Governanca

- [ ] 1.1 Cadastrar projeto `ConsoleDeGastos` no `MONOREPO.md`.
- [ ] 1.2 Criar pasta raiz isolada `ConsoleDeGastos/` com documento de entrada.
- [ ] 1.3 Inicializar workspace (`apps`, `services`, `packages`, `tests`).
- [ ] 1.4 Criar e preencher artefatos OpenSpec deste change.
- [ ] 1.5 Configurar scripts `verify` com `unit` e `integration` obrigatorios.

## 2. Sprint 1 - Auth e Assistente IA base

- [ ] 2.1 Implementar endpoints de auth (`google start/callback`, `magic-link`, `session`, `logout`).
- [ ] 2.2 Implementar sessao de assistente IA (`/api/v1/ai/sessions`).
- [ ] 2.3 Implementar mensagens do assistente (`/api/v1/ai/sessions/:id/messages`).
- [ ] 2.4 Implementar insights por tela (`/api/v1/ai/insights`).

## 3. Sprint 2 - Open Finance Pluggy

- [ ] 3.1 Implementar connect token e callback de conexao.
- [ ] 3.2 Implementar status e sincronizacao de conexao.
- [ ] 3.3 Implementar webhook idempotente de sync.

## 4. Sprint 3 - Modulos financeiros core

- [ ] 4.1 Implementar dashboard, transacoes e filtros.
- [ ] 4.2 Implementar recorrentes, fluxo de caixa e faturas.
- [ ] 4.3 Implementar contas, drawer de detalhe e categorias.

## 5. Sprint 4 - Projecao, patrimonio e relatorios

- [ ] 5.1 Implementar endpoint de projecao por cenario.
- [ ] 5.2 Implementar endpoint de patrimonio consolidado.
- [ ] 5.3 Implementar export e consulta de jobs de relatorio.

## 6. Sprint 5 - Acoes IA com confirmacao

- [ ] 6.1 Implementar preview de acoes IA (`/api/v1/ai/actions/preview`).
- [ ] 6.2 Implementar confirmacao obrigatoria (`/api/v1/ai/actions/:id/confirm`).
- [ ] 6.3 Implementar consulta de proposta/execucao (`/api/v1/ai/actions/:id`).
- [ ] 6.4 Implementar feedback da IA (`/api/v1/ai/feedback`).

## 7. Validacao e Fechamento

- [ ] 7.1 Garantir testes `unit` e `integration` verdes no `verify`.
- [ ] 7.2 Registrar mudanca de plano em `docs/plan-change-log.md`.
- [ ] 7.3 Registrar erro relevante em `docs/error-log.md` quando houver.
- [ ] 7.4 Rodar `openspec validate --all`.
