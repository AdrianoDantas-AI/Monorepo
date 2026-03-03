# AGENTS - Regra de Entrada no MonoRepo

## Regras Operacionais
1. Leitura obrigatoria de `MONOREPO.md` antes de qualquer acao em qualquer projeto interno.
2. Confirmar que o projeto-alvo esta cadastrado no registro central de `MONOREPO.md`.
3. Se o projeto nao estiver cadastrado, registrar primeiro no `MONOREPO.md` e so depois atuar no projeto.
4. Ao criar um projeto novo, atualizar o `MONOREPO.md` no mesmo ciclo de trabalho.
5. Toda mudanca de codigo deve incluir testes de `unit` e `integration` relacionados.

Documento central obrigatorio:
- [MONOREPO.md](C:/Users/Adriano%20Dantas/Monorepo/MONOREPO.md)

## Codex Review (OAuth)
Este repositorio usa review do Codex via GitHub App (OAuth), sem workflow local com `OPENAI_API_KEY`.

### Como usar
1. Ativar `Code review` nas configuracoes do Codex para este repositorio.
2. Abrir/atualizar PR normalmente.
3. Comentar no PR: `@codex review`.

### Review guidelines
- Priorizar bugs, regressao comportamental, risco de seguranca e quebra de contrato.
- Apontar falta de testes para comportamento alterado.
- Verificar isolamento multi-tenant por `tenant_id` em endpoints e queries.
- Validar observabilidade minima (logs com `tenant_id`, `trip_id`, `vehicle_id` e metricas essenciais).
- Reportar findings por severidade (`Critical`, `High`, `Medium`, `Low`) com path e recomendacao objetiva.

## Registro de Mudancas e Erros (Obrigatorio)
Antes de encerrar qualquer ciclo de trabalho, o agente deve:

1. Registrar mudancas de plano em `docs/plan-change-log.md`.
2. Registrar erros e correcoes em `docs/error-log.md`.
3. Incluir motivo da mudanca e causa raiz do erro quando houver.
4. Manter entradas curtas, datadas e objetivas.

Checklist de fechamento do agente:
- Plano mudou? Registrar em `docs/plan-change-log.md`.
- Ocorreu erro relevante? Registrar em `docs/error-log.md`.
- Houve mitigacao/prevecao? Registrar junto na mesma entrada.
- `unit` e `integration` foram adicionados/atualizados para a mudanca?
- `corepack pnpm --dir TNS verify` passou com os testes?
