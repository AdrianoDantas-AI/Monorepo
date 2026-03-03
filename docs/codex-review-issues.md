# Codex Review -> Catalogacao de Issues

Este repositorio possui automacao para converter findings do Codex review em issues rastreaveis.

## Disparo no PR
No PR alvo, comente:

```text
/codex-create-issues
```

Comando alternativo aceito:
```text
@codex create-issues
```

Tambem e possivel disparar manualmente via Actions (`workflow_dispatch`) informando o numero do PR.

## O que o workflow faz
1. Busca comentarios/reviews do bot do Codex no PR.
2. Ignora respostas sem finding (ex.: "Didn’t find any major issues").
3. Cria issues com label `codex-review`.
4. Aplica severidade (`severity/critical|high|medium|low`) quando detectada no texto.
5. Usa dedupe por marcador interno para nao duplicar issues ja criadas do mesmo finding.
6. Comenta no PR um resumo das issues criadas.

Workflow:
- `.github/workflows/codex-findings-to-issues.yml`

## Como corrigir o que foi apontado
Para cada issue criada:
1. Abrir branch de fix.
2. Reproduzir em teste (`unit` e/ou `integration`) antes do ajuste.
3. Implementar correcao minima.
4. Rodar:
   - `corepack pnpm --dir TNS verify`
5. Abrir PR com `Closes #<issue-id>`.
6. No PR de fix, pedir novo review:
   - `@codex review`

## Convencoes recomendadas
- Um finding por issue.
- Sem misturar correcoes de severidades diferentes no mesmo PR.
- Prioridade:
  - `severity/critical`, `severity/high`: corrigir antes de merge.
  - `severity/medium`, `severity/low`: planejar em sprint se nao bloquear release.
