## 1. Contrato e domínio de deep links

- [ ] 1.1 Definir tipo/DTO de deep links da próxima parada (trip_id, stop_id, google_maps, waze).
- [ ] 1.2 Implementar utilitário puro de geração de URL Google/Waze a partir de lat/lng e label da parada.
- [ ] 1.3 Implementar função determinística para resolver próxima parada elegível da trip.

## 2. API e integração com trips

- [ ] 2.1 Criar endpoint dedicado para deep links da trip com escopo por `x-tenant-id`.
- [ ] 2.2 Integrar endpoint ao repositório em memória atual respeitando isolamento multi-tenant.
- [ ] 2.3 Retornar erros de domínio explícitos quando não houver próxima parada.

## 3. Testes e documentação operacional

- [ ] 3.1 Adicionar testes unitários para geração de URLs e resolução da próxima parada.
- [ ] 3.2 Adicionar testes de integração do endpoint (sucesso, tenant divergente, sem próxima parada).
- [ ] 3.3 Atualizar `TNS/Codex-TNS.md` marcando `S2-015` e registrando contratos/exemplos.
- [ ] 3.4 Registrar plano/erros do ciclo em `docs/plan-change-log.md` e `docs/error-log.md`.
