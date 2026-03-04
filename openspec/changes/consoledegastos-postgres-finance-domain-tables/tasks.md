## 1. Persistencia tabular de agregados financeiros

- [ ] 1.1 Criar tabelas Postgres para `accounts`, `categories`, `invoices` e `recurrents`.
- [ ] 1.2 Implementar leitura (`load`) desses agregados via SQL e merge no `RuntimeStore`.
- [ ] 1.3 Implementar escrita (`save`) transacional desses agregados.

## 2. Compatibilidade e qualidade

- [ ] 2.1 Manter fallback memory e contratos HTTP atuais sem regressao.
- [ ] 2.2 Adicionar/ajustar testes unit/integration para os agregados migrados.
- [ ] 2.3 Rodar `corepack pnpm --dir ConsoleDeGastos verify`.
- [ ] 2.4 Rodar `openspec validate --all`.

## 3. Governanca

- [ ] 3.1 Registrar mudanca de plano em `docs/plan-change-log.md`.
- [ ] 3.2 Registrar erro relevante em `docs/error-log.md` quando houver.
