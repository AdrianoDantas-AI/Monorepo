## Why

A base tecnica do ConsoleDeGastos ja esta pronta (API, persistencia e docker), mas as telas reais do produto ainda nao foram implementadas. Precisamos de um plano fechado de execucao de UI para transformar preview tecnico em experiencia completa e validavel por usuarios.

## What Changes

- Definir plano end-to-end para implementacao das telas reais web e mobile parity.
- Entregar shell de navegacao, layout, design tokens e estados de carregamento/erro/vazio.
- Implementar cada modulo de tela com consumo dos endpoints existentes.
- Implementar experiencia visual do Open Finance (Pluggy), assistente IA contextual e acoes confirmadas na UI.
- Definir milestones de QA, acessibilidade, performance e readiness de release MVP.
- Adicionar sprint dedicada de testes reais com MCP Playwright (funcional + visual regression).
- Definir matriz de execucao Playwright (`smoke-pr` e `full-nightly`) como gate de qualidade.

## Capabilities

### New Capabilities
- `consoledegastos-ui-foundation-shell`: shell da aplicacao, layout global, navegacao e sistema de design da UI.
- `consoledegastos-ui-openfinance-connect`: fluxo visual completo de conexao Pluggy (modal, progresso, sucesso, erro e retry).
- `consoledegastos-ui-finance-core`: telas reais de dashboard, transacoes, recorrentes, fluxo de caixa, contas, drawer e faturas.
- `consoledegastos-ui-finance-strategic`: telas reais de categorias, projecao, patrimonio e relatorios.
- `consoledegastos-ui-ai-assistant`: chat global, cards de insight por tela e fluxo preview->confirm para acoes da IA.
- `consoledegastos-ui-quality-release`: qualidade final (testes e2e, a11y, performance, observabilidade de frontend e checklist de release).
- `consoledegastos-ui-playwright-real-tests`: suite real de QA web com MCP Playwright, smoke de PR, full nightly e baseline visual.

### Modified Capabilities
- None.

## Impact

- `ConsoleDeGastos/apps/web`: implementacao de telas reais e roteamento completo.
- `ConsoleDeGastos/apps/mobile`: parity de jornadas criticas e views principais.
- `ConsoleDeGastos/services/api`: possiveis ajustes pontuais de payload para UX (sem quebrar contratos v1).
- `ConsoleDeGastos/tests`: aumento de cobertura unit, integration e e2e para fluxos de UI.
- `ConsoleDeGastos/infra/docker/compose.yml`: manutencao da stack para validacao visual local.
- `.github/workflows/*`: jobs de `smoke-pr` e `full-nightly` com criterios de bloqueio de merge/release.
