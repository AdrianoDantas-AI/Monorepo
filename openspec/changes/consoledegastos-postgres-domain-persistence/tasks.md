## 1. Persistencia por tabelas (Postgres)

- [x] 1.1 Criar schema runtime com tabelas dedicadas para `sessions`, `open_finance_connections` e `transactions`.
- [x] 1.2 Implementar `load()` para reconstruir `RuntimeStore` combinando tabelas modeladas + snapshot auxiliar.
- [x] 1.3 Implementar `save()` com transacao e `upsert` para agregados modelados.

## 2. Compatibilidade e testes

- [x] 2.1 Manter fallback `memory` intacto e contrato de `/ops/persistence`.
- [x] 2.2 Adicionar/ajustar testes unit/integration relacionados a persistencia.
- [x] 2.3 Rodar `corepack pnpm --dir ConsoleDeGastos verify`.
- [x] 2.4 Rodar `openspec validate --all`.

## 3. Governanca

- [x] 3.1 Registrar mudanca de plano em `docs/plan-change-log.md`.
- [x] 3.2 Registrar erro relevante em `docs/error-log.md` quando houver.
