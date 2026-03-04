## Why

Precisamos iniciar o produto ConsoleDeGastos como projeto isolado no monorepo, com escopo completo de telas financeiras, integracao Pluggy (Open Finance) e assistente de IA contextual com confirmacao de acoes.

## What Changes

- Criar projeto dedicado `ConsoleDeGastos/` na raiz do monorepo.
- Entregar base tecnica para Web/App/API/Domain/Contracts com testes `unit` e `integration`.
- Definir e publicar especificacoes OpenSpec para todos os modulos de tela e fluxo de IA.
- Formalizar roadmap de execucao por sprints no `tasks.md`.

## Capabilities

### New Capabilities
- `consoledegastos-openfinance-access`
- `consoledegastos-dashboard`
- `consoledegastos-transactions`
- `consoledegastos-recurring`
- `consoledegastos-cashflow`
- `consoledegastos-accounts`
- `consoledegastos-account-drawer`
- `consoledegastos-invoices`
- `consoledegastos-categories`
- `consoledegastos-forecast`
- `consoledegastos-patrimony`
- `consoledegastos-reports`
- `consoledegastos-subscription-view`
- `consoledegastos-mobile-parity`
- `consoledegastos-observability-security`
- `consoledegastos-ai-assistant`

## Impact

- Novo projeto isolado no monorepo sem dependencia operacional do TNS.
- Novos endpoints de auth/openfinance/finance/ai no `services/api` do projeto.
- Cobertura inicial de testes automatizados obrigatorios ja no bootstrap.
