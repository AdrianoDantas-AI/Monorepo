## Context

O ConsoleDeGastos ja possui backend, persistencia postgres e stack docker full. O gap para o MVP real esta na camada de interface: as telas atuais de web e mobile sao apenas preview tecnico sem fluxo completo de produto.

A referencia visual e funcional veio dos prints enviados (sidebar completa, dashboard com cards e graficos, tabelas de transacoes, recorrentes, fluxo de caixa, contas/faturas/categorias, projecao, patrimonio, relatorios e IA contextual).

## Goals / Non-Goals

**Goals:**
- Entregar UX real de ponta a ponta na web para todos os modulos do MVP.
- Entregar parity mobile para jornadas criticas do MVP.
- Conectar UI aos endpoints v1 ja existentes sem quebrar contratos.
- Incluir estados de loading, empty, erro e retry em todos os modulos.
- Fechar com criterios objetivos de qualidade (a11y, e2e, performance e observabilidade de frontend).

**Non-Goals:**
- Reescrever backend ou contratos v1 como parte principal desse ciclo.
- Implementar billing/paywall no MVP.
- Implementar multi-tenant B2B.

## Decisions

1. **Sequenciamento por trilhas de valor (nao por tecnologia)**
- Implementacao guiada por jornadas completas (ex.: Dashboard+Transacoes) em vez de blocos isolados de componentes.
- Alternativa considerada: construir design system completo antes de qualquer tela.
- Motivo da decisao: reduzir risco de atraso e gerar valor validavel por sprint.

2. **Shell e design tokens primeiro, modulos depois**
- Sidebar, topbar, tipografia, cores, spacing, componentes base e layout responsivo entram antes das telas finais.
- Alternativa considerada: implementar cada tela com estilos locais.
- Motivo da decisao: manter consistencia visual e reduzir retrabalho.

3. **Camada de dados de frontend com contratos tipados**
- Criar clientes por modulo usando DTO v1 existentes e tratamento centralizado de erro/loading.
- Alternativa considerada: fetch direto em cada pagina.
- Motivo da decisao: evitar duplicacao e facilitar testes.

4. **Parity mobile orientada a jornadas criticas**
- Mobile acompanha os fluxos de maior uso primeiro (dashboard, transacoes, contas/faturas, IA e openfinance).
- Alternativa considerada: parity 100% imediata de todas as telas.
- Motivo da decisao: manter velocidade sem comprometer entregas chave.

5. **Qualidade como gate de release, nao etapa final isolada**
- Cada sprint inclui testes de UI + regressao visual basica; sprint final consolida hardening.
- Alternativa considerada: deixar testes de UI apenas no fim.
- Motivo da decisao: reduzir risco de bugs acumulados.

6. **Sprint extra de testes reais com MCP Playwright apos hardening**
- Apos o hardening, sera executada sprint dedicada para validacao real de jornadas web com Playwright MCP.
- Alternativa considerada: executar Playwright durante hardening ou em paralelo com parity mobile.
- Motivo da decisao: concentrar validacao final com ambiente estabilizado e reduzir ruido de retrabalho durante implementacao de telas.

7. **Matriz de execucao de testes Playwright com dois niveis**
- `smoke-pr` para fluxos criticos obrigatorios em todo PR e `full-nightly` para cobertura funcional + visual completa.
- Alternativa considerada: apenas suite unica em PR.
- Motivo da decisao: balancear tempo de feedback no PR com profundidade de cobertura diaria.

8. **Escopo web-first para sprint de Playwright**
- A automacao Playwright cobre web real com visual regression; mobile nativo continua validado por parity/checklist.
- Alternativa considerada: automacao mobile nativa no mesmo sprint.
- Motivo da decisao: Playwright atende melhor web e reduz risco de ampliar escopo do MVP.

## Risks / Trade-offs

- **Risco: volume alto de telas no mesmo ciclo** -> Mitigacao: fatiar por sprint com criterios de aceite objetivos por modulo.
- **Risco: divergencia entre web e mobile** -> Mitigacao: checklist de parity por jornada e revisao semanal de gaps.
- **Risco: latencia e payload inconsistentes na UX real** -> Mitigacao: camada de dados com fallback, skeletons e telemetria de erro/perf.
- **Risco: IA gerar acoes sem contexto claro na UI** -> Mitigacao: fluxo obrigatorio preview -> confirm com auditoria visivel ao usuario.

## Migration Plan

1. Implementar shell e design tokens sem remover endpoints existentes.
2. Migrar cada modulo de preview para tela real gradualmente (feature flags locais por rota quando necessario).
3. Validar cada grupo com testes unit/integration/e2e antes de avancar para o proximo.
4. Consolidar parity mobile nas jornadas definidas.
5. Rodar hardening final e checklist tecnico de release MVP.
6. Executar sprint dedicada de testes reais com MCP Playwright (`smoke-pr` + `full-nightly` + visual regression).
7. Consolidar evidencias, fechar gates de qualidade e concluir governanca OpenSpec.

## Open Questions

- Qual biblioteca de graficos final (Recharts vs ECharts) para dashboard/fluxo/patrimonio?
- Quais telas mobile serao "read-only" no MVP e quais suportarao acao completa?
