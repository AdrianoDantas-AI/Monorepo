## Context

O MVP do ConsoleDeGastos exige modulos financeiros centrais com comportamento consistente ao reiniciar a API e sincronizar dados. A estrategia incremental adotada foi migrar primeiro agregados mais criticos; agora precisamos cobrir os agregados financeiros principais.

## Goals / Non-Goals

**Goals:**
- Persistir `accounts`, `categories`, `invoices` e `recurrents` em tabelas no Postgres.
- Reconstruir `RuntimeStore` com esses agregados via leitura tabular.
- Preservar contratos HTTP e semantica dos endpoints atuais.

**Non-Goals:**
- Migrar agregados de IA/auditoria neste ciclo.
- Alterar payloads de API.
- Introduzir ORMs ou alterar stack de runtime.

## Decisions

1. **Expansao do modelo hibrido existente**
- Manter pattern atual: tabelas para agregados modelados + snapshot auxiliar para nao modelados.

2. **Persistencia transacional por ciclo de save**
- `save()` continua em transacao unica para evitar divergencia entre tabelas e snapshot.

3. **Sem alteracao de contrato externo**
- Mudanca restrita a persistencia interna do backend.

## Risks / Trade-offs

- **Risco:** aumento de operacoes SQL por request mutante.
  **Mitigacao:** manter escritas em lote por tabela dentro de transacao unica.

- **Risco:** inconsistencias de mapeamento (enum/tipos numéricos).
  **Mitigacao:** normalizacao explicita na camada adapter e cobertura de testes.

- **Risco:** acoplamento do adapter ficar extenso.
  **Mitigacao:** extrair helpers por agregado em arquivo dedicado quando necessario.
