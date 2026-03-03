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
