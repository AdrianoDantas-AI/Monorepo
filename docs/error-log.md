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

## 2026-03-03 - `@codex review` sem resposta no PR de smoke test
- Sintoma: PR criado e comentario `@codex review` publicado, mas sem comentario de retorno do Codex apos polling.
- Causa raiz: Integracao OAuth do Codex possivelmente nao habilitada/instalada para este repositorio ou aguardando propagacao de configuracao.
- Correcao aplicada: Validado que o comentario foi publicado com sucesso e mantido PR #1 aberto para nova tentativa apos ajuste de configuracao no Codex/GitHub.
- Prevencao/acao futura: Confirmar no painel do Codex que `Code review` esta ativo para `CaosHorseman/Monorepo` e que o app tem permissao no repositorio.
- Referencias (comando/arquivo): PR `#1`, comentario `@codex review`, `gh pr view --comments`.
