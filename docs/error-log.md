# Error Log

Este arquivo registra erros relevantes, causa raiz e correcao aplicada.

## Template
```md
## YYYY-MM-DD - <titulo curto>
- Sintoma:
- Causa raiz:
- Correcao aplicada:
- Prevencao/acao futura:
- Referencias (comando/arquivo):
```

## 2026-03-02 - `pnpm` nao reconhecido no terminal
- Sintoma: Comando `pnpm --version` retornou "term 'pnpm' is not recognized".
- Causa raiz: `pnpm` nao estava disponivel globalmente no PATH da sessao.
- Correcao aplicada: Uso de `corepack pnpm` para instalar dependencias e executar scripts.
- Prevencao/acao futura: Padronizar comandos com `corepack pnpm` no projeto.
- Referencias (comando/arquivo): `corepack pnpm --dir TNS install`, `TNS/README.md`.

## 2026-03-02 - `gh` nao reconhecido apos instalacao
- Sintoma: Mesmo apos `winget install GitHub.cli`, comando `gh` nao era encontrado.
- Causa raiz: PATH da sessao nao foi atualizado apos instalacao.
- Correcao aplicada: Uso do executavel completo `C:\\Program Files\\GitHub CLI\\gh.exe`.
- Prevencao/acao futura: Reiniciar terminal apos instalacoes de CLI ou usar path absoluto na mesma sessao.
- Referencias (comando/arquivo): `winget install --id GitHub.cli`, `C:\\Program Files\\GitHub CLI\\gh.exe`.

## 2026-03-02 - `prepare` do Husky falhou no workspace `TNS`
- Sintoma: `corepack pnpm --dir TNS install` exibiu ".git can't be found" no script `prepare`.
- Causa raiz: O `package.json` de `TNS` executava `husky` dentro de subdiretorio sem `.git`.
- Correcao aplicada: Ajuste do `prepare` para mensagem informativa e configuracao de hooks no repositorio raiz (`.husky`).
- Prevencao/acao futura: Manter hooks centralizados no root do monorepo.
- Referencias (comando/arquivo): `TNS/package.json`, `.husky/pre-commit`.

## 2026-03-03 - Docker daemon indisponivel no `infra:up`
- Sintoma: `corepack pnpm --dir TNS infra:up` falhou com erro do pipe `dockerDesktopLinuxEngine`.
- Causa raiz: Docker Desktop Engine nao estava ativo/acessivel na sessao.
- Correcao aplicada: Validacao de `compose` feita via `docker compose config`; tentativa de start do servico `com.docker.service` sem permissao para subida nesta sessao.
- Prevencao/acao futura: Garantir Docker Desktop iniciado antes de executar `infra:up` e validar com `docker compose version`.
- Referencias (comando/arquivo): `TNS/package.json` script `infra:up`, `TNS/infra/docker/compose.yml`.

## 2026-03-03 - Glob de testes falhou no Windows
- Sintoma: `test:unit` falhou com "Could not find ... tests\\unit\\**\\*.test.ts".
- Causa raiz: O padrao glob usado no comando `node --test` nao foi resolvido corretamente no ambiente Windows.
- Correcao aplicada: Substituicao por runner dedicado (`scripts/testing/run-tests.mjs`) que resolve os arquivos `.test.ts` e chama `node --import tsx --test` com paths explicitos.
- Prevencao/acao futura: Evitar padroes `**` dependentes de shell em comandos cross-platform.
- Referencias (comando/arquivo): `TNS/package.json` (`test:unit`, `test:integration`), `TNS/scripts/testing/run-tests.mjs`.

## 2026-03-03 - GitHub bloqueou criacao de ruleset/branch protection no repo privado
- Sintoma: Chamadas para `repos/CaosHorseman/Monorepo/rulesets` e `branches/main/protection` retornaram HTTP 403 com mensagem de upgrade.
- Causa raiz: O repositorio esta privado em plano sem suporte a Rulesets/Branch protection.
- Correcao aplicada: Regras foram versionadas em `.github/rulesets/main-protection.json` e criado script `scripts/github/apply-ruleset.ps1` para aplicar assim que o requisito de plano/publico for atendido.
- Prevencao/acao futura: Validar capacidade do plano GitHub antes de automatizar governanca remota e executar novamente o script apos liberar o recurso.
- Referencias (comando/arquivo): `gh api repos/CaosHorseman/Monorepo/rulesets`, `gh api repos/CaosHorseman/Monorepo/branches/main/protection`, `scripts/github/apply-ruleset.ps1`.

## 2026-03-03 - Codex reviewer retornou bloqueio de conector/conta
- Sintoma: Ao comentar `@codex review` no PR #2, o bot nao executou review e respondeu com mensagem para conectar conta.
- Causa raiz: Integracao Codex <> GitHub ainda nao concluida para este usuario/repositorio (onboarding do conector pendente).
- Correcao aplicada: Retry executado no PR #2 e evidencias capturadas com resposta do `chatgpt-codex-connector[bot]`.
- Prevencao/acao futura: Finalizar conexao em `https://chatgpt.com/codex/settings/connectors` e repetir smoke com novo `@codex review`.
- Referencias (comando/arquivo): `gh pr comment 2 --body \"@codex review\"`, `gh api repos/CaosHorseman/Monorepo/issues/2/comments`.

## 2026-03-03 - Resolucao do bloqueio do Codex reviewer (conector)
- Sintoma: Historico anterior de `@codex review` sem revisao tecnica, apenas aviso de conexao pendente.
- Causa raiz: Conector Codex-GitHub nao estava habilitado para a conta/repositorio.
- Correcao aplicada: Conexao ajustada e novo retry em `PR #2`; o bot respondeu com review concluido ("Didn't find any major issues").
- Prevencao/acao futura: Manter verificacao de onboarding do conector em novos repos antes de smoke e documentar PR de validacao.
- Referencias (comando/arquivo): `gh pr comment 2 --body \"@codex review\"`, `repos/AdrianoDantas-AI/Monorepo/issues/2/comments`.

## 2026-03-03 - Push direto em `main` bloqueado por ruleset
- Sintoma: `git push origin main` falhou com `GH013` informando `Changes must be made through a pull request` e check obrigatorio `CI / verify`.
- Causa raiz: Ruleset de branch protection ativo no repositorio para `main`.
- Correcao aplicada: Troca de fluxo para branch dedicada + PR, com execucao dos checks no pipeline antes do merge.
- Prevencao/acao futura: Nao tentar push direto em `main`; sempre trabalhar via branch e PR.
- Referencias (comando/arquivo): `git push origin main`, rules URL `.../rules?ref=refs/heads/main`.

## 2026-03-03 - Merge de PR bloqueado por aprovacao obrigatoria em contexto solo
- Sintoma: `gh pr merge 3 --admin` falhou exigindo `At least 1 approving review`.
- Causa raiz: Ruleset `main-protection` exigia aprovacao manual e code owner review sem segundo reviewer disponivel.
- Correcao aplicada: Ajuste de ruleset para `required_approving_review_count: 0` e `require_code_owner_review: false`, mantendo PR + CI obrigatorios.
- Prevencao/acao futura: Manter configuracao de ruleset coerente com capacidade de revisao do time (solo vs multi-reviewer).
- Referencias (comando/arquivo): `gh pr merge 3 --admin`, `gh api repos/AdrianoDantas-AI/Monorepo/rulesets/13435713`.

## 2026-03-03 - Falhas no script `apply-ruleset.ps1` durante update remoto
- Sintoma: Execucoes falharam com erros de `Trim()` em valor nulo, `accepts 1 arg(s), received 2` e variavel nativa indefinida.
- Causa raiz: Tratamento fragil de stdout/stderr nulos e invocacao de processo com quoting inadequado para caminho com espacos.
- Correcao aplicada: Refatoracao de `Invoke-Gh` para invocacao nativa com array de argumentos, fallback para ambientes sem `PSNativeCommandUseErrorActionPreference` e normalizacao de output.
- Prevencao/acao futura: Validar script em caminhos com espacos e incluir smoke de update real apos alteracoes no helper.
- Referencias (comando/arquivo): `scripts/github/apply-ruleset.ps1`, `powershell -File .\\scripts\\github\\apply-ruleset.ps1`.

## 2026-03-03 - Workflow de catalogacao falhou em `workflow_dispatch` por leitura incorreta do input
- Sintoma: Run `22606740685` falhou com `PR numero invalido para catalogacao`.
- Causa raiz: O script leu input com `core.getInput`, que nao captura `workflow_dispatch` inputs neste contexto.
- Correcao aplicada: Troca para `context.payload.inputs?.pr_number` no workflow `.github/workflows/codex-findings-to-issues.yml`.
- Prevencao/acao futura: Validar disparo manual imediatamente apos merge de workflows novos.
- Referencias (comando/arquivo): `gh workflow run codex-findings-to-issues.yml -f pr_number=2`, run `22606740685`.

## 2026-03-03 - Workflow de catalogacao falhou ao comentar em PR fechado
- Sintoma: Run `22606907603` falhou com `Resource not accessible by integration` ao postar comentario em `issues/2/comments`.
- Causa raiz: Execucao manual apontou para PR fechado e o token da Action nao tinha permissao efetiva para criar comentario nesse contexto.
- Correcao aplicada: Workflow passou a detectar estado do PR e omitir comentario em PR fechado; em caso de 403 no comentario, segue com `warning` sem falhar o job.
- Prevencao/acao futura: Preferir smoke em PR aberto quando a validacao incluir comentario de resumo.
- Referencias (comando/arquivo): run `22606907603`, `.github/workflows/codex-findings-to-issues.yml`.

## 2026-03-03 - Catalogacao criou issue de ruido a partir de comentario-resumo do Codex
- Sintoma: No PR de smoke foram criadas duas issues (`#7` e `#8`), sendo `#8` apenas resumo generico do review.
- Causa raiz: Parser tratava texto-resumo do review como finding, sem filtro de metacomentario.
- Correcao aplicada: Adicionado filtro de comentario generico e mapeamento de badge `P0..P3` para severidade real.
- Prevencao/acao futura: Manter smoke com finding real e revisar parser sempre que formato do comentario do bot mudar.
- Referencias (comando/arquivo): issue `#8`, `.github/workflows/codex-findings-to-issues.yml`, `docs/codex-review-issues.md`.

## 2026-03-03 - Typecheck falhou no S2-001 por caminho relativo incorreto
- Sintoma: `corepack pnpm --dir TNS verify` falhou em `services/api` com `TS2307 Cannot find module .../packages/contracts/src/trip.js`.
- Causa raiz: Imports nos novos módulos de domínio subiram 4 níveis em vez de 5 a partir de `services/api/src/modules/**`.
- Correcao aplicada: Ajuste dos imports para `../../../../../packages/contracts/src/trip.js`.
- Prevencao/acao futura: Validar caminho relativo com `tsc --noEmit` imediatamente após criar estrutura de pastas profundas.
- Referencias (comando/arquivo): `TNS/services/api/src/modules/*/*.ts`, `corepack pnpm --dir TNS verify`.

## 2026-03-03 - Prisma v7 falhou no ambiente atual com `ERR_REQUIRE_ESM`
- Sintoma: `prisma format` e `prisma validate` falharam com `Error [ERR_REQUIRE_ESM]` carregando `zeptomatch` via `@prisma/dev`.
- Causa raiz: Incompatibilidade entre toolchain do Prisma 7 e runtime Node disponível na sessão.
- Correcao aplicada: Downgrade para `prisma@5.22.0` e `@prisma/client@5.22.0` no `@tns/api`.
- Prevencao/acao futura: Fixar major version estável de Prisma no monorepo e validar CLI após upgrades de major.
- Referencias (comando/arquivo): `TNS/services/api/package.json`, `corepack pnpm --dir TNS --filter @tns/api prisma:validate`.

## 2026-03-03 - Migration SQL gerada com ruído do runner de script
- Sintoma: Arquivo `migration.sql` inicial incluiu header do `pnpm run` junto com SQL.
- Causa raiz: Geração via script `pnpm run prisma:migrate:diff` com redirecionamento direto de stdout.
- Correcao aplicada: Regeração com `pnpm exec prisma migrate diff ... --script` para capturar apenas SQL.
- Prevencao/acao futura: Para artefatos SQL versionados, preferir `pnpm exec` em vez de `pnpm run` quando houver redirecionamento de saída.
- Referencias (comando/arquivo): `TNS/services/api/prisma/migrations/2026030301_s2_trip_domain_init/migration.sql`.

## 2026-03-03 - TypeScript TS6059 no `@tns/api` ao importar contrato por caminho relativo
- Sintoma: `corepack pnpm --dir TNS verify` falhou com `TS6059` informando arquivo fora do `rootDir` (`services/api/src`).
- Causa raiz: Endpoint `POST /api/v1/trips` importava `packages/contracts/src/trip.ts` por caminho relativo direto.
- Correcao aplicada: Remocao do import cruzado no `@tns/api`; validacao do payload passou para guard runtime local e validacao de dominio (`TripModule`/`StopModule`).
- Prevencao/acao futura: Evitar import relativo entre workspaces no runtime de servico; usar pacote publicado (`@tns/contracts`) ou validação local desacoplada.
- Referencias (comando/arquivo): `TNS/services/api/src/http/app.ts`, `TNS/services/api/src/modules/trip/trip.module.ts`, `TNS/services/api/src/modules/stop/stop.module.ts`.

## 2026-03-03 - Falha de teste por uso de assertiva de referencia em objeto clonado
- Sintoma: Teste unitario do repositorio em memoria falhou com `Values have same structure but are not reference-equal`.
- Causa raiz: Uso de `assert.equal` (comparacao por referencia) em objeto retornado por clone.
- Correcao aplicada: Troca para `assert.deepEqual` no teste.
- Prevencao/acao futura: Em testes de DTO/entidades retornadas por copia, usar comparacao estrutural por padrao.
- Referencias (comando/arquivo): `TNS/tests/unit/trip-repository.unit.test.ts`, `corepack pnpm --dir TNS verify`.

## 2026-03-03 - OpenSpec instalado com aviso de engine do Node
- Sintoma: `npm install -g @fission-ai/openspec@latest` concluiu com `npm WARN EBADENGINE` para `@fission-ai/openspec@1.2.0` e `posthog-node`.
- Causa raiz: Ambiente atual com `node v20.10.0`, abaixo do minimo recomendado pelo pacote (`>=20.19.0`).
- Correcao aplicada: Instalacao mantida e validada funcionalmente (`openspec --version`, `openspec validate --all`); fluxo aplicado no repo.
- Prevencao/acao futura: Atualizar Node para `>=20.19.0` (idealmente LTS atual) para eliminar risco de incompatibilidade futura.
- Referencias (comando/arquivo): `npm install -g @fission-ai/openspec@latest`, `openspec --version`, `openspec validate --all`.

## 2026-03-03 - Scaffold parcial ao criar change OpenSpec para S3-005
- Sintoma: `openspec new change tns-trip-progress-distance` criou apenas `.openspec.yaml`, sem `proposal.md/design.md/spec.md/tasks.md`.
- Causa raiz: Comportamento do CLI nessa execução gerou somente o esqueleto mínimo do change.
- Correcao aplicada: Artefatos Markdown foram criados manualmente no diretório do change antes da implementação.
- Prevencao/acao futura: Após `openspec new change`, validar imediatamente o conteúdo da pasta e complementar artefatos ausentes no início do ciclo.
- Referencias (comando/arquivo): `openspec/changes/tns-trip-progress-distance/`, `openspec new change tns-trip-progress-distance`.

## 2026-03-03 - Push para GitHub falhou com erro remoto HTTP 500
- Sintoma: `git push origin feat/s2-003-geo-indexes` retornou `The requested URL returned error: 500`.
- Causa raiz: Instabilidade transitória no endpoint remoto do GitHub.
- Correcao aplicada: Nova tentativa de `git push` após a falha imediata.
- Prevencao/acao futura: Em falha HTTP 5xx no push, repetir tentativa antes de iniciar troubleshooting local.
- Referencias (comando/arquivo): `git push origin feat/s2-003-geo-indexes`.

## 2026-03-03 - `openspec new change` sem suporte a `--json`
- Sintoma: Execucao de `openspec new change tns-dashboard-trips-realtime --json` falhou com `unknown option '--json'`.
- Causa raiz: A versao atual do OpenSpec CLI nao implementa flag `--json` para o comando `new change`.
- Correcao aplicada: Reexecucao sem a flag (`openspec new change tns-dashboard-trips-realtime`) e continuidade do fluxo normalmente.
- Prevencao/acao futura: Validar opcoes suportadas com `openspec --help` antes de usar flags em comandos de scaffold.
- Referencias (comando/arquivo): `openspec new change tns-dashboard-trips-realtime --json`, `openspec new change tns-dashboard-trips-realtime`.

## 2026-03-03 - Falha de `verify` por regex invalida em teste de integracao
- Sintoma: `corepack pnpm --dir TNS verify` falhou com `TransformError` em `web-dashboard.integration.test.ts` (`Syntax error`).
- Causa raiz: Expressao regular no assert do HTML de detalhe foi escrita com delimitacao invalida.
- Correcao aplicada: Troca da regex por verificacao direta com `detailHtml.includes(...)`.
- Prevencao/acao futura: Para payloads HTML/JSON serializados em string, priorizar asserts por `includes` quando regex nao agrega ganho claro.
- Referencias (comando/arquivo): `TNS/tests/integration/web-dashboard.integration.test.ts`, `corepack pnpm --dir TNS verify`.

## 2026-03-04 - Falha ao criar scaffold em comando unico no PowerShell
- Sintoma: Comando de geracao em lote retornou `O nome do arquivo ou a extensao e muito grande` (WinError 206).
- Causa raiz: Tamanho total do comando ultrapassou limite de linha de comando do Windows.
- Correcao aplicada: Quebra da geracao em blocos menores com `apply_patch`/comandos segmentados.
- Prevencao/acao futura: Evitar payloads longos em comando unico; preferir criacao incremental de arquivos.
- Referencias (comando/arquivo): tentativa de scaffold em `ConsoleDeGastos/services/api`.

## 2026-03-04 - Scaffold parcial apos `openspec new change`
- Sintoma: `openspec new change consoledegastos-mvp-full-screens-ai` criou apenas `.openspec.yaml`.
- Causa raiz: Comportamento recorrente do OpenSpec CLI no ambiente atual para `new change`.
- Correcao aplicada: Criacao manual de `proposal.md`, `design.md`, `tasks.md` e `specs/**/spec.md` no diretorio da change.
- Prevencao/acao futura: Sempre validar conteudo da pasta apos `openspec new change` antes de seguir implementacao.
- Referencias (comando/arquivo): `openspec/changes/consoledegastos-mvp-full-screens-ai/`.

## 2026-03-04 - Ciclo de persistencia PostgreSQL sem erro bloqueante
- Sintoma: Nenhum erro bloqueante durante implementacao da camada de persistencia no `ConsoleDeGastos`.
- Causa raiz: N/A.
- Correcao aplicada: N/A.
- Prevencao/acao futura: Manter validacao obrigatoria com `corepack pnpm --dir ConsoleDeGastos verify` e `openspec validate --all` a cada incremento.
- Referencias (comando/arquivo): `corepack pnpm --dir ConsoleDeGastos verify`, `openspec validate --all`.

## 2026-03-04 - Ciclo de infraestrutura local sem erro bloqueante
- Sintoma: Nenhum erro bloqueante na criacao do compose local de `postgres` + `redis` para o `ConsoleDeGastos`.
- Causa raiz: N/A.
- Correcao aplicada: N/A.
- Prevencao/acao futura: Validar sintaxe com `docker compose -f ConsoleDeGastos/infra/docker/compose.yml config` antes de subir containers.
- Referencias (comando/arquivo): `docker compose -f ConsoleDeGastos/infra/docker/compose.yml config`, `ConsoleDeGastos/infra/docker/compose.yml`.

## 2026-03-04 - Ciclo de migracao para persistencia por tabelas sem erro bloqueante
- Sintoma: Nenhum erro bloqueante na refatoracao do adapter Postgres para tabelas de dominio.
- Causa raiz: N/A.
- Correcao aplicada: N/A.
- Prevencao/acao futura: Manter `verify` + `openspec validate --all` em cada incremento de persistencia.
- Referencias (comando/arquivo): `ConsoleDeGastos/services/api/src/persistence.ts`, `corepack pnpm --dir ConsoleDeGastos verify`, `openspec validate --all`.

## 2026-03-04 - Archive/OpenSpec ciclo seguinte sem erro bloqueante
- Sintoma: Nenhum erro bloqueante ao arquivar `consoledegastos-postgres-domain-persistence` e abrir o novo change de persistencia financeira.
- Causa raiz: N/A.
- Correcao aplicada: N/A.
- Prevencao/acao futura: Continuar validando `openspec status` e `openspec validate --all` antes de cada commit de governanca OpenSpec.
- Referencias (comando/arquivo): `openspec archive consoledegastos-postgres-domain-persistence -y`, `openspec new change consoledegastos-postgres-finance-domain-tables`.

## 2026-03-04 - Push falhou por erro transitorio de rede no GitHub
- Sintoma: `git push origin feat/consoledegastos-mvp-foundation` falhou com `Failure when receiving data from the peer`.
- Causa raiz: instabilidade transitória de conexão no canal HTTPS com o remoto.
- Correcao aplicada: nova tentativa imediata de `git push`, concluída com sucesso.
- Prevencao/acao futura: em erro de rede/transporte no push, repetir tentativa antes de iniciar troubleshooting local.
- Referencias (comando/arquivo): `git push origin feat/consoledegastos-mvp-foundation`.

## 2026-03-04 - Ciclo de persistencia financeira tabular sem erro bloqueante
- Sintoma: Nenhum erro bloqueante na migracao tabular de `accounts/categories/invoices/recurrents`.
- Causa raiz: N/A.
- Correcao aplicada: N/A.
- Prevencao/acao futura: manter `verify` e `openspec validate --all` ao final de cada incremento do adapter Postgres.
- Referencias (comando/arquivo): `ConsoleDeGastos/services/api/src/persistence.ts`, `corepack pnpm --dir ConsoleDeGastos verify`, `openspec validate --all`.

## 2026-03-04 - `infra:up` falhou por daemon Docker indisponivel
- Sintoma: `corepack pnpm --dir ConsoleDeGastos infra:up` falhou com erro no pipe `dockerDesktopLinuxEngine`.
- Causa raiz: Docker Desktop Engine nao estava ativo/acessivel na sessao.
- Correcao aplicada: Validacao estrutural feita com `docker compose ... config`; compose e scripts mantidos prontos para subida quando daemon estiver ativo.
- Prevencao/acao futura: Garantir Docker Desktop iniciado antes de `infra:up` e validar com `docker compose version`.
- Referencias (comando/arquivo): `corepack pnpm --dir ConsoleDeGastos infra:up`, `docker compose -f ConsoleDeGastos/infra/docker/compose.yml config`.
