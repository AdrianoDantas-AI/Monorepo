## 1. Sprint 1 - Foundation UI (Shell + Design System)

- [x] 1.1 Definir rotas web por modulo.
- [x] 1.2 Implementar AppShell (sidebar, topbar e content).
- [x] 1.3 Criar tokens base (cor, tipografia, spacing, radius e shadow).
- [x] 1.4 Implementar componentes base (Button, Card, Badge, Input, EmptyState, ErrorState, Skeleton).
- [x] 1.5 Implementar responsividade do shell.
- [x] 1.6 Implementar guarda de rota por sessao autenticada.
- [x] 1.7 Criar sandbox interno de componentes.
- [x] 1.8 Adicionar testes unit de componentes e navegacao.

## 2. Sprint 2 - Open Finance Access + Dashboard (Tela real)

- [x] 2.1 Implementar tela de acesso Open Finance.
- [x] 2.2 Implementar modal Pluggy com estados (auth, progresso, sucesso e falha).
- [x] 2.3 Implementar retry e fechamento seguro do modal.
- [x] 2.4 Implementar cards reais do Dashboard consumindo `/api/v1/dashboard`.
- [x] 2.5 Implementar blocos de transacoes recentes e proximas despesas.
- [x] 2.6 Implementar filtros de periodo e comparativos.
- [x] 2.7 Implementar estados loading, empty e error do dashboard.
- [x] 2.8 Adicionar testes integration da jornada conectar conta -> atualizar dashboard.

## 3. Sprint 3 - Transacoes (Tela real)

- [x] 3.1 Implementar busca com debounce.
- [x] 3.2 Implementar filtros avancados (periodo, tipo, categoria, conta/cartao).
- [x] 3.3 Implementar tabela real com ordenacao e paginacao.
- [x] 3.4 Implementar cabecalho de metricas agregadas.
- [x] 3.5 Implementar criacao manual de transacao.
- [x] 3.6 Implementar recategorizacao por linha.
- [x] 3.7 Implementar exportacao CSV.
- [x] 3.8 Adicionar E2E do modulo de transacoes.

## 4. Sprint 4 - Recorrentes + Fluxo de Caixa + Faturas

- [ ] 4.1 Implementar Recorrentes com abas Despesas/Receitas.
- [ ] 4.2 Implementar anel de progresso mensal (pago vs previsto).
- [ ] 4.3 Implementar lista por data com progresso de parcela.
- [ ] 4.4 Implementar Fluxo de Caixa com grafico consolidado e tendencia.
- [ ] 4.5 Implementar cards de gastos/receitas com variacao percentual.
- [ ] 4.6 Implementar Faturas com breakdown mensal.
- [ ] 4.7 Implementar cards por cartao com drilldown.
- [ ] 4.8 Adicionar integration/E2E dos tres modulos.

## 5. Sprint 5 - Contas + Drawer + Categorias

- [ ] 5.1 Implementar tela Contas (cartoes, contas e conexoes).
- [ ] 5.2 Implementar banner de instabilidade institucional.
- [ ] 5.3 Implementar adicionar conta e desconectar conexao.
- [ ] 5.4 Implementar drawer Detalhes da Conta.
- [ ] 5.5 Implementar edicao de alias de conta.
- [ ] 5.6 Implementar CRUD de categorias.
- [ ] 5.7 Implementar limites por categoria.
- [ ] 5.8 Implementar recategorizacao em lote.
- [ ] 5.9 Adicionar E2E de contas/drawer/categorias.

## 6. Sprint 6 - Projecao + Patrimonio + Relatorios

- [ ] 6.1 Implementar tela Projecao (base, otimista e conservador).
- [ ] 6.2 Implementar drivers principais e faixa de confianca.
- [ ] 6.3 Implementar tela Patrimonio (ativos, dividas e historico).
- [ ] 6.4 Implementar composicao percentual por ativo/divida.
- [ ] 6.5 Implementar banner de sincronizacao de investimentos.
- [ ] 6.6 Implementar tela Relatorios com filtros.
- [ ] 6.7 Implementar export assincro CSV/PDF com status de job.
- [ ] 6.8 Adicionar integration/E2E dos modulos estrategicos.

## 7. Sprint 7 - Assistente IA na UI

- [ ] 7.1 Implementar painel global de chat IA.
- [ ] 7.2 Implementar insights automaticos por tela.
- [ ] 7.3 Implementar modo quick-insight e deep-analysis.
- [ ] 7.4 Implementar preview de acao IA.
- [ ] 7.5 Implementar confirmacao explicita obrigatoria.
- [ ] 7.6 Implementar historico de propostas e execucoes.
- [ ] 7.7 Adicionar E2E preview -> confirm -> execute.

## 8. Sprint 8 - Mobile Parity (jornadas criticas)

- [ ] 8.1 Definir navegacao mobile (tabs/stack/drawer).
- [ ] 8.2 Implementar shell mobile equivalente.
- [ ] 8.3 Implementar Dashboard e Transacoes mobile.
- [ ] 8.4 Implementar Contas e Faturas mobile.
- [ ] 8.5 Implementar Open Finance connect mobile.
- [ ] 8.6 Implementar IA mobile nas jornadas criticas.
- [ ] 8.7 Executar checklist de parity web/mobile.

## 9. Sprint 9 - Hardening e Release MVP UI

- [ ] 9.1 Consolidar testes unit/integration/e2e.
- [ ] 9.2 Rodar baseline de acessibilidade nas telas principais.
- [ ] 9.3 Otimizar performance de carregamento inicial.
- [ ] 9.4 Implementar observabilidade de frontend.
- [ ] 9.5 Revisar copy, empty states e mensagens de erro.
- [ ] 9.6 Executar smoke completo no ambiente dockerizado full-stack.
- [ ] 9.7 Atualizar runbook e guia de QA do ConsoleDeGastos.
- [ ] 9.8 Registrar evidencias e checklist Go/No-Go.

## 10. Sprint 10 - Testes Reais com MCP Playwright (Extra)

- [ ] 10.1 Configurar suite MCP Playwright para ambiente dockerizado real.
- [ ] 10.2 Definir matriz de execucao (`PR: smoke critico`, `nightly: suite completa`).
- [ ] 10.3 Preparar dados deterministicos (seed, usuario e conexoes de teste).
- [ ] 10.4 Implementar page objects e fixtures por modulo.
- [ ] 10.5 Automatizar jornada de login e sessao.
- [ ] 10.6 Automatizar jornada Open Finance connect com simulacao controlada de callback/status.
- [ ] 10.7 Automatizar jornada completa de Dashboard.
- [ ] 10.8 Automatizar jornada de Transacoes (filtro, paginacao, recategorizacao e CSV).
- [ ] 10.9 Automatizar jornada de Contas/drawer/Faturas.
- [ ] 10.10 Automatizar jornada IA (insight + preview + confirm).
- [ ] 10.11 Ativar visual regression por tela-chave (baseline, tolerancia e review de diffs).
- [ ] 10.12 Coletar artefatos em falha (trace, video, screenshot, console e network).
- [ ] 10.13 Definir politica de flake (retry controlado + quarantine com prazo).
- [ ] 10.14 Publicar relatorio consolidado (pass rate, falhas criticas e evidencias).
- [ ] 10.15 Fechar gate de aceite da sprint (`100% smoke critico`, `zero falha critica aberta`, `visual diffs aprovados`).

## 11. Sprint 11 - Governanca OpenSpec e Fechamento

- [ ] 11.1 Atualizar progresso das tasks por sprint durante a implementacao.
- [ ] 11.2 Registrar desvios de plano em `docs/plan-change-log.md`.
- [ ] 11.3 Registrar erros e correcoes em `docs/error-log.md`.
- [ ] 11.4 Executar `corepack pnpm --dir ConsoleDeGastos verify`.
- [ ] 11.5 Executar `openspec validate --all`.
- [ ] 11.6 Preparar `openspec archive` do change quando 100% concluido.
