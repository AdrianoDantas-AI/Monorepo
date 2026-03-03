# Plan Change Log

Este arquivo registra mudancas de plano e o motivo de cada mudanca.

## Template
```md
## YYYY-MM-DD - <titulo curto>
- Contexto:
- Decisao anterior:
- Decisao nova:
- Motivo da mudanca:
- Impacto no backlog/sprint:
- Referencias (arquivos/PR/issue):
```

## 2026-03-02 - Revisao do Codex via OAuth
- Contexto: Foi iniciado setup de reviewer no GitHub.
- Decisao anterior: Usar workflow local em `.github/workflows/codex-reviewer.yml` com `OPENAI_API_KEY`.
- Decisao nova: Migrar para review via OAuth do Codex (GitHub App), sem workflow local com segredo de API no repositorio.
- Motivo da mudanca: Reduzir acoplamento com segredo manual e alinhar com fluxo oficial de review (`@codex review`).
- Impacto no backlog/sprint: Remove manutencao de workflow custom de reviewer e simplifica operacao de PR.
- Referencias (arquivos/PR/issue): `AGENTS.md`, remocao de `.github/workflows/codex-reviewer.yml`.

## 2026-03-02 - Planejamento expandido para Sprints 2-4
- Contexto: O planejamento inicial estava focado em Sprint 1.
- Decisao anterior: Manter backlog detalhado apenas ate Sprint 1.
- Decisao nova: Adicionar planejamento completo ate deploy local + readiness para AWS staging (Sprints 2, 3 e 4).
- Motivo da mudanca: Necessidade de visao de entrega de medio prazo e sequenciamento fechado ate release candidate local.
- Impacto no backlog/sprint: Sprint 1 mantida; roadmap e criterios de Go/No-Go definidos para proximas sprints.
- Referencias (arquivos/PR/issue): `TNS/Codex-TNS.md` (secoes 13 a 17).

## 2026-03-03 - Validacao de Docker alterada por indisponibilidade de daemon
- Contexto: Execucao do bloco de Sprint 1 para `infra:up` e smoke de containers.
- Decisao anterior: Validar runtime com `corepack pnpm --dir TNS infra:up` e `infra:down`.
- Decisao nova: Validar estruturalmente com `docker compose config` e manter `infra:up` pendente para quando o daemon estiver ativo.
- Motivo da mudanca: Docker Desktop Engine indisponivel na sessao de execucao.
- Impacto no backlog/sprint: Implementacao de compose/Dockerfiles concluida; validacao de subida real fica como passo operacional imediato.
- Referencias (arquivos/PR/issue): `TNS/infra/docker/compose.yml`, `docs/error-log.md`.

## 2026-03-03 - Unit e integration como regra mandatória com enforcement
- Contexto: Necessidade explicita de impedir entregas sem testes reais.
- Decisao anterior: `verify` executava lint/typecheck/test, mas podia passar com zero testes.
- Decisao nova: Tornar `unit` e `integration` obrigatorios por regra e por script (`test:guard`) no `TNS`.
- Motivo da mudanca: Garantir cobertura minima real em toda mudanca e evitar falso positivo de pipeline verde sem testes.
- Impacto no backlog/sprint: CI/local passam a falhar quando nao houver arquivos de `unit` e `integration`; adicionados testes iniciais.
- Referencias (arquivos/PR/issue): `MONOREPO.md`, `AGENTS.md`, `TNS/package.json`, `TNS/scripts/testing/require-test-files.mjs`.

## 2026-03-03 - Ruleset do GitHub migrado para modelo "as code"
- Contexto: Solicitacao para criar ruleset de protecao da branch `main`.
- Decisao anterior: Aplicar ruleset diretamente no repositorio via GitHub API/CLI.
- Decisao nova: Versionar payload do ruleset no repo e aplicar via script, mantendo tentativa automatica de publicacao.
- Motivo da mudanca: GitHub bloqueou `rulesets` e `branch protection` em repo privado no plano atual (HTTP 403).
- Impacto no backlog/sprint: Governanca do ruleset fica pronta no codigo, mas a ativacao remota depende de tornar o repo publico ou upgrade de plano.
- Referencias (arquivos/PR/issue): `.github/rulesets/main-protection.json`, `scripts/github/apply-ruleset.ps1`, `scripts/github/README.md`, `docs/error-log.md`.

## 2026-03-03 - Diagnostico do Codex review ajustado para conector GitHub
- Contexto: Novas tentativas de `@codex review` em PR de smoke continuaram sem review tecnico.
- Decisao anterior: Tratar o problema como possivel falha geral do bot no repositorio.
- Decisao nova: Tratar como bloqueio de onboarding do conector (conta Codex + GitHub ainda nao efetivamente conectados para o usuario/repo).
- Motivo da mudanca: O bot respondeu explicitamente com instrucao para conectar conta no link de settings do Codex.
- Impacto no backlog/sprint: Review automatico segue bloqueado ate concluir conexao do conector; smoke deve ser repetido apos habilitacao.
- Referencias (arquivos/PR/issue): `PR #2`, comentarios `chatgpt-codex-connector[bot]`.

## 2026-03-03 - Codex review validado apos ajuste de conector
- Contexto: Usuario confirmou ajuste do conector e solicitou novo retry.
- Decisao anterior: Considerar review automatico bloqueado no repositorio.
- Decisao nova: Retomar uso de `@codex review` como fluxo padrao de smoke/review.
- Motivo da mudanca: Novo comentario no PR #2 retornou resposta positiva do bot com review concluido.
- Impacto no backlog/sprint: Reativacao do reviewer automatico para PRs futuros; remover bloqueio operacional do checklist.
- Referencias (arquivos/PR/issue): `PR #2`, comentario `chatgpt-codex-connector[bot]` em `2026-03-03T02:55:47Z`.

## 2026-03-03 - Catalogacao de findings do Codex em issues automatizada
- Contexto: Necessidade de transformar findings de review em backlog acionavel sem trabalho manual repetitivo.
- Decisao anterior: Catalogar findings manualmente em issues.
- Decisao nova: Automatizar catalogacao via workflow GitHub com comando no PR (`@codex create-issues`) e deduplicacao.
- Motivo da mudanca: Padronizar triagem, garantir rastreabilidade e acelerar correcao de apontamentos.
- Impacto no backlog/sprint: Findings do review passam a gerar issues com severidade e plano de correcao de forma consistente.
- Referencias (arquivos/PR/issue): `.github/workflows/codex-findings-to-issues.yml`, `docs/codex-review-issues.md`, `AGENTS.md`.

## 2026-03-03 - Entrega via PR obrigatoria por ruleset ativo
- Contexto: Publicacao do workflow de catalogacao foi inicialmente tentada com push direto em `main`.
- Decisao anterior: Enviar alteracao diretamente para `main`.
- Decisao nova: Publicar via branch dedicada e PR, respeitando gates de branch protection.
- Motivo da mudanca: Repositorio passou a exigir merge via PR + status check `CI / verify`.
- Impacto no backlog/sprint: Leve aumento no ciclo de entrega (abertura de PR), com ganho de governanca e rastreabilidade.
- Referencias (arquivos/PR/issue): erro `GH013` no push para `main`, rules de branch no GitHub.

## 2026-03-03 - Ruleset ajustado para fluxo solo com CI obrigatorio
- Contexto: PR de tooling ficou bloqueado por exigencia de aprovacao manual (`required_approving_review_count: 1`) sem segundo reviewer com write.
- Decisao anterior: Exigir 1 aprovacao + code owner review para `main`.
- Decisao nova: Manter PR obrigatorio + check `CI / verify`, removendo exigencia de aprovacao manual (`0`) e code owner review no ruleset.
- Motivo da mudanca: Habilitar merge operacional em contexto solo sem perder gate tecnico de CI.
- Impacto no backlog/sprint: PRs passam a ser mergeaveis pelo maintainer apos CI verde; reduz bloqueio administrativo.
- Referencias (arquivos/PR/issue): `.github/rulesets/main-protection.json`, `scripts/github/apply-ruleset.ps1`, `PR #3`.

## 2026-03-03 - CI passou a validar mudancas em workflows
- Contexto: O check obrigatorio `CI / verify` nao era disparado em alteracoes fora de `TNS/**`.
- Decisao anterior: CI com filtro de paths restrito a `TNS/**`.
- Decisao nova: Incluir `.github/workflows/**` no gatilho de CI.
- Motivo da mudanca: Evitar PR bloqueado por check esperado e nao executado quando houver mudanca de workflow.
- Impacto no backlog/sprint: Todo ajuste de workflow passa a validar no mesmo pipeline obrigatorio.
- Referencias (arquivos/PR/issue): `.github/workflows/ci.yml`, `PR #3`.

## 2026-03-03 - Ajuste de input do workflow de catalogacao para dispatch manual
- Contexto: Validacao manual do workflow de catalogacao falhou apos merge inicial.
- Decisao anterior: Ler numero do PR via `core.getInput(\"pr_number\")`.
- Decisao nova: Ler numero do PR via `context.payload.inputs?.pr_number` para evento `workflow_dispatch`.
- Motivo da mudanca: Corrigir leitura de input no contexto de `actions/github-script`.
- Impacto no backlog/sprint: Permite disparo manual confiavel para smoke e operacao de catalogacao.
- Referencias (arquivos/PR/issue): `.github/workflows/codex-findings-to-issues.yml`, run `22606740685`.

## 2026-03-03 - Workflow de catalogacao resiliente para PR fechado
- Contexto: Smoke manual em PR fechado falhou ao tentar comentar resumo no PR.
- Decisao anterior: Sempre comentar resumo no PR ao final da catalogacao.
- Decisao nova: Comentar apenas quando o PR estiver aberto; em 403 de comentario, registrar warning e nao quebrar o workflow.
- Motivo da mudanca: Evitar falha operacional por restricao de permissao em contextos de PR fechado.
- Impacto no backlog/sprint: Workflow fica robusto para dispatch manual de auditoria sem interromper catalogacao.
- Referencias (arquivos/PR/issue): `.github/workflows/codex-findings-to-issues.yml`, run `22606907603`.

## 2026-03-03 - Parser de findings ajustado para reduzir ruido e mapear P0-P3
- Contexto: Loop de smoke gerou issue real e issue de ruido por metacomentario do bot.
- Decisao anterior: Tratar qualquer corpo nao vazio sem regex de severidade como `triage`.
- Decisao nova: Ignorar texto-resumo generico do Codex e mapear badge `P0..P3` diretamente para severidade.
- Motivo da mudanca: Melhorar precisao da catalogacao e diminuir backlog falso-positivo.
- Impacto no backlog/sprint: Issues criadas ficam mais acionaveis, com rotulo de severidade mais fiel.
- Referencias (arquivos/PR/issue): `.github/workflows/codex-findings-to-issues.yml`, `docs/codex-review-issues.md`, issues `#7` e `#8`.
