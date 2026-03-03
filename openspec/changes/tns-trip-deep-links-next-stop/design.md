## Context

No TNS, o backend já mantém `Trip`, `Stop`, `Leg`, `RoutePlan` e `RouteTrack`, com endpoints de criação, leitura, otimização e início da trip. A estratégia de produto definida no `Codex-TNS.md` usa navegação terceirizada no MVP (Google Maps/Waze), então o backend precisa entregar links consistentes para a próxima parada.

## Goals / Non-Goals

**Goals:**
- Gerar deep links válidos para Google Maps e Waze com base na próxima parada da trip.
- Definir comportamento determinístico para seleção da próxima parada.
- Expor payload pronto para consumo pelo app/cliente.
- Garantir cobertura `unit` e `integration`.

**Non-Goals:**
- Implementar SDK de navegação embutida.
- Resolver navegação offline.
- Cobrir múltiplos provedores além de Google/Waze nesta fase.

## Decisions

1. **Gerador isolado de deep links no backend**
- Racional: centraliza regra e evita divergência entre clientes.
- Alternativa: montar link no frontend/mobile. Rejeitada para manter lógica única.

2. **Endpoint dedicado por trip para próxima parada**
- Racional: simplifica consumo e evita recomputo em múltiplos pontos.
- Alternativa: embutir somente no `GET /trips/:id`. Rejeitada para manter contrato claro e evolutivo.

3. **Formato de payload com múltiplos provedores**
- Racional: permitir escolha no cliente sem nova chamada.
- Alternativa: retornar apenas um link ativo. Rejeitada por reduzir flexibilidade.

4. **Seleção da próxima parada por ordem + progresso atual**
- Racional: regra simples, testável e compatível com dados atuais.
- Alternativa: heurística por geolocalização em tempo real nesta sprint. Rejeitada por aumentar complexidade antes do tracking completo da Sprint 3.

## Risks / Trade-offs

- **Risco:** trip sem dados suficientes de rota/parada para gerar link.
  **Mitigação:** retornar erro de domínio explícito (`400/404`) e mensagem orientativa.

- **Risco:** inconsistência de parada alvo entre endpoints.
  **Mitigação:** reutilizar função única de resolução da próxima parada e cobrir por testes.

- **Risco:** formato de URL variar por provider/locale.
  **Mitigação:** padronizar templates de URL e validar strings geradas em testes.
