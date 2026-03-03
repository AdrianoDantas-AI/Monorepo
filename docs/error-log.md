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
