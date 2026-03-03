## 1. API proxy e rota de pagina

- [x] 1.1 Implementar endpoint `GET /api/alerts` no `web-dashboard` com repasse de filtros para `GET /api/v1/alerts`.
- [x] 1.2 Implementar rota HTML `GET /alerts`.
- [x] 1.3 Reaproveitar `WEB_DASHBOARD_API_BASE_URL` e tenant scoping no proxy.

## 2. UI de alertas

- [x] 2.1 Criar HTML da tela de alertas com formulario de filtros (`trip_id`, `severity`, `status`).
- [x] 2.2 Implementar carregamento de dados em `/api/alerts` e renderizacao de total/tabela.
- [x] 2.3 Atualizar navegacao da lista e detalhe de trip para incluir link de alerts.

## 3. Qualidade e governanca

- [x] 3.1 Adicionar testes unitarios para normalizacao de filtros do proxy de alerts.
- [x] 3.2 Adicionar testes de integracao para `/alerts` e `/api/alerts`.
- [x] 3.3 Atualizar `TNS/Codex-TNS.md` e `docs/plan-change-log.md` marcando `S3-015` concluido.
