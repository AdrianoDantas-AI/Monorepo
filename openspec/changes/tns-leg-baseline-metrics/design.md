## Context

Atualmente cada `leg` guarda `distance_m` e `duration_s`, mas faltava semantica explicita de baseline planejado para comparacao com valores dinamicos futuros.

## Decisions

1. **Baseline como parte do LegDTO**
- Campos novos: `baseline_distance_m` e `baseline_eta_s`.
- Mantidos junto de `distance_m`/`duration_s` para leitura simples no dominio.

2. **Preenchimento no gerador de route plan**
- `generateRoutePlanFromStops` passa a persistir baseline no mesmo ciclo de criacao das legs.

3. **Compatibilidade de modulo de dominio**
- `LegModule.fromStops` aceita baseline opcional e, quando ausente, normaliza para `distance_m`/`duration_s`.

## Trade-offs

- Contrato de leg fica mais verboso.
- Ganho: evita ambiguidade em regras de detour e analise historica.
