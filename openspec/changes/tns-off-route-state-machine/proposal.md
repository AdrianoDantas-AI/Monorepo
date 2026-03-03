## Why

Sem máquina de estado, a detecção de desvio não consegue distinguir suspeita inicial de confirmação robusta.

## What Changes

- Implementar state machine pura com estados `normal`, `suspected` e `confirmed`.
- Suportar confirmação por número de pings e por janela de tempo.
- Implementar retorno para `normal` ao voltar ao corredor.
- Cobrir com testes unit e integration usando tiers versionados.

## Impact

- Regras de detecção passam a ser determinísticas e testáveis.
- Base pronta para eventos `off_route.suspected.v1` e `off_route.confirmed.v1`.
