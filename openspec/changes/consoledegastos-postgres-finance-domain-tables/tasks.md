## 1. Persistencia tabular de agregados financeiros

- [x] 1.1 Criar tabelas Postgres para `accounts`, `categories`, `invoices` e `recurrents`.
- [x] 1.2 Implementar leitura (`load`) desses agregados via SQL e merge no `RuntimeStore`.
- [x] 1.3 Implementar escrita (`save`) transacional desses agregados.

## 2. Compatibilidade e qualidade

- [x] 2.1 Manter fallback memory e contratos HTTP atuais sem regressao.
- [x] 2.2 Adicionar/ajustar testes unit/integration para os agregados migrados.
- [x] 2.3 Rodar `corepack pnpm --dir ConsoleDeGastos verify`.
- [x] 2.4 Rodar `openspec validate --all`.

## 3. Governanca

- [x] 3.1 Registrar mudanca de plano em `docs/plan-change-log.md`.
- [x] 3.2 Registrar erro relevante em `docs/error-log.md` quando houver.
