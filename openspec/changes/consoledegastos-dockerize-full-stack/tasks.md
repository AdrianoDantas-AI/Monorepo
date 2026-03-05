## 1. Dockerizacao de servicos

- [x] 1.1 Criar Dockerfiles para API, Web e Mobile preview.
- [x] 1.2 Criar `.dockerignore` no workspace `ConsoleDeGastos`.
- [x] 1.3 Implementar servidores preview (`web` e `mobile`) com endpoint de health.

## 2. Compose e scripts

- [x] 2.1 Atualizar `infra/docker/compose.yml` para incluir `api`, `web`, `mobile-preview`, `postgres` e `redis`.
- [x] 2.2 Ajustar scripts root `infra:up/down/logs/ps` para stack completa.
- [x] 2.3 Atualizar README com fluxo de 1 comando e URLs de acesso.

## 3. Validacao e governanca

- [x] 3.1 Rodar `docker compose -f ConsoleDeGastos/infra/docker/compose.yml config`.
- [x] 3.2 Rodar `corepack pnpm --dir ConsoleDeGastos verify`.
- [x] 3.3 Rodar `openspec validate --all`.
- [x] 3.4 Registrar mudanca de plano em `docs/plan-change-log.md`.
- [x] 3.5 Registrar erro relevante em `docs/error-log.md` quando houver.
