## Why

Para calcular detour com confianca na Sprint 3, cada `leg` precisa manter os valores planejados originais de distancia e ETA como baseline explicito.

## What Changes

- Expandir `LegDTO` com `baseline_distance_m` e `baseline_eta_s`.
- Persistir baseline no momento de geracao de `route_plan`.
- Ajustar contratos e snapshots para refletir novos campos.
- Cobrir comportamento em testes unit e integration.

## Impact

- Contrato de `TripDTO/LegDTO` fica mais explicito para comparacoes planejado vs atual.
- Base pronta para regras futuras de detour sem recalculo ambiguo.
