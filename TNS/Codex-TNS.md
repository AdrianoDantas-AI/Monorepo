# Codex.md — SaaS de Planejamento de Rota (Tracking + Detecção de Desvio)

Este repositório é um monorepo para um SaaS de **gestão de frota em tempo real**, com:

- tracking por GPS (pings),
- comparação **rota planejada vs rota executada**,
- métricas (km percorridos, km restantes, ETA aproximado),
- **alertas de desvio** (fora do corredor **e/ou** aumento de tempo/distância),
- **roteirização com múltiplas paradas** (otimização de ordem das entregas/visitas).

A navegação do motorista no MVP é **terceirizada (Opção 1)** via deep link (Google Maps/Waze).
**Mapbox entra como alternativa ao Google Maps Platform** para: (a) mapa do dashboard (Mapbox GL), (b) cálculo de rotas (Directions), (c) map-matching e geocoding quando necessário.
Evolução planejada: **navegação embutida (Opção 2)** com SDK (Mapbox Navigation SDK ou Google Navigation).

---

## 1) Premissas (não-negociáveis do MVP)

### Tracking

- O motorista **não precisa** de navegação dentro do app no MVP.
- O app do motorista (ou integração com rastreador) envia **pings** com:
  - `timestamp`, `lat`, `lng`, `accuracy_m`, `speed_mps`, `heading_deg` (quando disponível), `device_id`, `driver_id`, `vehicle_id`, `trip_id`.
- O sistema mantém um “estado quente” do veículo (última posição + status) e um histórico (para auditoria/relatórios).

### Tiers de Ping e Detecção

A detecção usa “corredor” (buffer) + confirmação para reduzir falso positivo.

| Tier   | Ping | Corredor (fora da rota) | Detecção típica | Uso                                      |
| ------ | ---: | ----------------------: | --------------: | ---------------------------------------- |
| Gold   |   1s |                     10m |            2–5s | compliance/segurança/auditoria pesada    |
| Silver |  15s |                     30m |          30–60s | operação urbana padrão                   |
| Bronze |  30s |                    100m |         60–180s | visibilidade macro e custo/bateria baixo |

**Confirmação (recomendado):**

- Gold: fora >10m por **5 pings** OU **8s** contínuos.
- Silver: fora >30m por **2 pings** OU **45s** contínuos.
- Bronze: fora >100m por **2–3 pings** OU **120s** contínuos.

**Filtro anti-ruído:**

- Se `accuracy_m` estiver ruim (ex.: > 30–50m), **não** dispare alerta imediato; marque como “suspeita” e peça confirmação por janela.

### Desvio também por “detour” (tempo/distância)

Além de “fora do corredor”, detectamos desvio por piora de tempo/distância para o próximo destino.

- **Detour por tempo (threshold padrão):**
  - dispara se `ETA_atual` > `ETA_planejado` + **max(20%, 8 min)**
- **Detour por distância (threshold padrão):**
  - dispara se `dist_atual` > `dist_planejado` + **max(15%, 2 km)**

No Bronze, aumente thresholds (ex.: 30% ou 12 min) para evitar ruído.

### Ping adaptativo (economia com “turbo” quando importa)

Mesmo com Bronze default:

- Normal: 30s / 100m
- Suspeita: 15s / 30m por 2–3 min
- Confirmado: 1s / 10m por 60–120s (para coletar trilha de auditoria)

---

## 2) Arquitetura (visão de serviços)

### Serviços

- **API (REST)**: gestão (tenants, veículos, motoristas, viagens, paradas, rotas, relatórios)
- **Ingest API**: endpoint leve e rápido para receber pings (alta taxa)
- **Realtime Gateway (WS)**: atualizações em tempo real do dashboard
- **Workers**: processamento assíncrono (map-matching opcional, métricas, alertas, exports)
- **Scheduler**: tarefas recorrentes (health checks, reconciliação, agregações)

### Data Stores

- **PostgreSQL + PostGIS**: entidades e geoespacial (rotas, paradas, geofences)
- **Timeseries (TimescaleDB ou particionamento)**: tabela de posições (pings)
- **Redis**: estado quente (última posição, viagens ativas), rate limit, filas (BullMQ)
- **Object Storage (S3)**: exports, arquivos, snapshots

### Infra (AWS baseline)

- ECS Fargate (API/Workers) ou EKS (se necessário)
- RDS Postgres + ElastiCache Redis
- SQS/SNS (alternativa ao Redis para filas/alertas)
- CloudWatch + OpenTelemetry + Sentry

---

## 3) Fluxos principais (MVP)

### Fluxo A — Criar viagem com múltiplas paradas (roteirização)

1. Usuário cria `Trip` com `Stops` (endereços/latlng).
2. Sistema resolve geocoding (se necessário) e roda **otimização de ordem** (VRP/TSP).
3. Sistema gera rota por **perna** (Stop i -> Stop i+1) com polyline + distância + duração estimada.
4. App do motorista recebe lista de paradas e a “próxima perna”.

### Fluxo B — Motorista navega (Opção 1) + tracking

1. App abre deep link para Google Maps/Waze com destino = próxima parada.
2. App envia pings conforme tier/ping adaptativo.
3. Backend calcula:
   - posição projetada na polyline (progresso),
   - km percorridos/pendentes,
   - detecção de desvio (corredor + detour).
4. Eventos são enviados ao dashboard via WS.

### Fluxo C — Alertas

- Eventos de interesse:
  - `OFF_ROUTE_SUSPECTED`, `OFF_ROUTE_CONFIRMED`, `BACK_ON_ROUTE`
  - `DETOUR_TIME`, `DETOUR_DISTANCE`
  - `STOPPED_TOO_LONG` (opcional)
- Canais: dashboard (WS) + push/email/SMS (por plano).

---

## 4) Estrutura do repositório (monorepo)

```
route-saas/
  apps/
    web-dashboard/                 # Next.js (dashboard)
    driver-mobile/                 # React Native (tracking + deep link)
  services/
    api/                           # NestJS (REST + auth + tenants + trips)
    ingest/                        # Fastify/Nest micro (ping ingest)
    realtime/                      # WS gateway (socket.io)
    worker/                        # jobs (BullMQ) - métricas/alertas/exports
  packages/
    shared/                        # tipos TS, validações, utils (geo, polyline)
    contracts/                     # contratos de eventos (schemas) e OpenAPI
    ui/                            # design system (opcional)
  infra/
    terraform/                     # IaC (VPC, RDS, ECS, Redis, etc.)
    docker/                        # Dockerfiles, compose local
  docs/
    Codex.md                       # este arquivo
    Architecture.md
    ADR/                           # decisões arquiteturais
  scripts/
    seed/                          # carga inicial (demo tenants, veículos, trips)
    migrations/                    # wrappers para migrações
  .github/
    workflows/                     # CI (lint/test/build/deploy)
  README.md
```

---

## 5) Padrões de engenharia (qualidade e consistência)

## 5.1) Guardrails de Qualidade (regra de ferro)

### Regra 0 — Nada nasce sem teste

- **100% das funcionalidades** devem vir acompanhadas de teste(s) automatizados.
- PR sem teste = **PR reprovado** (sem exceção).
- Correção de bug = **teste que reproduz o bug primeiro**, depois o fix.

### Regra 1 — Double-check obrigatório (duas camadas)

- `CODEOWNERS` por áreas sensíveis (auth/ingest/infra) para chamar reviewer certo automaticamente.
- PR template com checklist curta e auto-label por path.

Cada entrega passa por dois filtros:

1. **Determinístico**: lint + typecheck + testes + cobertura mínima + análise estática.
2. **Revisor** (humano e/ou IA): checklist de arquitetura + segurança + multi-tenant + custos de API.

### Checklist de Review (mínimo)

- O contrato/schemas foram atualizados e versionados?
- Existe teste que falha sem a mudança e passa com a mudança?
- Multi-tenant: `tenant_id` está sempre escopado?
- Custos: existe cache/rate-limit para chamadas de mapas?
- Observabilidade: logs/métricas foram adicionados?
- Migrações estão presentes e reversíveis?

### Regra 2 — Planejamento mínimo antes de codar

Antes de implementar uma feature:

- Escrever o **contrato** (DTO/schema/evento) e o **happy path**.
- Definir **casos de erro** + **observabilidade** (logs/métricas).
- Criar tarefas pequenas (máx. 1–2h cada) para evitar PRs gigantes.

### Regra 3 — Gates no CI (branch protection)

Obrigatório em `main` e `release/*`:

- `pnpm lint` (ou equivalente)
- `pnpm typecheck`
- `pnpm test` (unit + integration essenciais)
- **coverage mínima por pacote** (ex.: 80% core; 70% app — ajustar por maturidade)
- security baseline: SCA (dependências) + secrets scan (gitleaks) + SAST leve (Semgrep/CodeQL) + container scan (Trivy)
  - **bloqueia só em High/Critical**; Medium/Low vira warning + issue

### Regra 4 — Observabilidade como parte do DoD

- Toda rota crítica e job crítico tem:
  - logs JSON com `tenant_id`, `trip_id`, `vehicle_id`
  - métricas (latência, filas, taxa de alertas)
  - tracing (OpenTelemetry) onde fizer sentido

### Regra 5 — Custos de Map API sob controle

- Chamadas caras (route/eta/matching) devem ser:
  - cacheadas quando possível,
  - feitas sob demanda (suspeita/intervalo),
  - com limites por tenant/plano.

### Linguagem/Stack

- TypeScript em tudo (web/mobile/backend)
- Backend: NestJS (API), Fastify (Ingest)
- DB: Postgres + PostGIS; Redis; TimescaleDB opcional
- Observabilidade: OpenTelemetry; logs JSON

### Provedor de Mapas (abstração obrigatória)

Para evitar lock-in e controlar custos, o código usa uma interface única `MapProvider` com adaptadores:

- `GoogleProvider`: Routes/Geocoding (quando escolhido)
- `MapboxProvider`: Directions/Geocoding/Map Matching (alternativa recomendada)
  Isso garante que a troca de provedor não reescreva o produto.

### Estilo e regras

- DTOs validados (zod/class-validator) e contratos versionados.
- Eventos versionados (ex.: `off_route.confirmed.v1`).
- Sem lógica “mágica” no front: tudo que é regra de desvio vive no backend.

### Testes (obrigatórios) — pirâmide prática

- **Unit (rápidos, muitos):**
  - geo utils (distância ponto→linha, projeção na polyline, km restante)
  - detecção (tiers, confirmação, filtro por accuracy, detour)
  - roteirização (ordenação de paradas) com fixtures
- **Integration (médio):**
  - ingest -> fila -> worker -> persistência -> evento
  - alertas -> WS -> dashboard (contrato do payload)
  - multi-tenant scoping/RLS (um tenant não enxerga outro)
- **E2E (poucos, críticos):**
  - criar trip com stops -> simular pings -> validar alertas e progresso
  - export/relatório básico
- **Contrato (sempre):**
  - schemas (OpenAPI/eventos) testados com snapshots/validação

### Segurança

- Multi-tenant com RLS (Row Level Security) ou scoping estrito por `tenant_id`.
- Auth: JWT (MVP) com RBAC; SSO futuro.
- Rate limiting por tenant no ingest.

---

## 5.2) Segurança sem engessar (camada leve e automática)

Objetivo: **bloquear só o que é perigoso** e automatizar o resto. Segurança aqui é “cinto de segurança”, não “freio de mão puxado”.

### Camada A — Automática no CI (sempre)

- **SCA** (Dependências): vulnerabilidades em libs (ex.: npm audit / osv / snyk/dep scan).
- **Secrets scan**: impede token/senha indo pro Git (ex.: gitleaks).
- **SAST leve** (código): regras rápidas (ex.: Semgrep/CodeQL) focadas em auth, SQL injection, SSRF, RCE.
- **Container scan**: imagem base e pacotes (ex.: Trivy) — rápido e objetivo.

**Regra de bloqueio (para não travar dev):**

- Falha o PR **apenas** em `Critical/High` confirmados.
- `Medium/Low` vira **warning + issue automática** (não bloqueia).
- Permitir **override com justificativa** via label (`security-override`) + criação automática de ticket e prazo.

### Camada B — Review de segurança (risk-based, 2 minutos)

Nem todo PR merece paranoia. A revisão extra só é exigida quando mexer em:

- autenticação/autorização (JWT, RBAC, SSO)
- multi-tenant scoping/RLS
- ingest público (endpoint de pings), rate limiting, webhooks
- billing (Stripe), permissões administrativas
- queries SQL/ORM “raw”, serialização, upload/download

**Como detectar sem burocracia:**

- PR template com checkbox “toca área sensível?”
- ou labels automáticas por path (`services/ingest`, `services/api/auth`, `packages/contracts`, `infra/`).

Quando cair em área sensível, o PR precisa de:

- 1 reviewer extra (não precisa ser “time de segurança”; pode ser **Security Champion da semana**)
- checklist curta (abaixo)

### Checklist de segurança (curto e útil)

- Entrada externa validada (DTO/schema) e limites (tamanho/rate)?
- Autorização checada em todos os endpoints (tenant_id escopado)?
- Dados sensíveis não aparecem em logs?
- Existe proteção contra abuso (rate limit/backoff) no ingest?
- Dependências novas foram justificadas?

### Camada C — Threat model “lite” (só para features grandes)

Para mudanças grandes (ex.: novo canal de integração, novo modo de auth), escrever 10 linhas em `docs/ADR/`:

- superfície exposta
- principais riscos
- mitigação
- como monitorar (métrica/alerta)

## 6) Contratos (eventos e entidades) — resumo

### Entidades principais

- `Tenant`, `User`, `Vehicle`, `Driver`, `Device`
- `Trip`, `Stop`, `Leg`, `RoutePlan`, `RouteTrack`
- `PositionPing`, `AlertEvent`

### Evento (exemplo)

```json
{
  "event": "off_route.confirmed.v1",
  "tenant_id": "t_123",
  "trip_id": "trip_456",
  "vehicle_id": "veh_789",
  "ts": "2026-03-02T18:10:00Z",
  "data": {
    "tier": "bronze",
    "distance_to_route_m": 142,
    "confidence": 0.86,
    "rule": "2_pings_outside_100m"
  }
}
```

---

## 7) Roadmap (TODO por fases)

### Fase 0 — Fundacional (1–2 semanas)

- Monorepo + CI (lint/typecheck/test/build) + **branch protection** (gates obrigatórios)
- Infra local (docker compose) + Postgres/PostGIS + Redis
- Autenticação + multi-tenant base
- CRUD: veículos, motoristas, dispositivos

### Fase 1 — MVP (Opção 1: deep link + tracking)

- Implementar `MapProvider` + adaptadores (Mapbox padrão; Google opcional)
- Criar Trip com múltiplas paradas (Stops)
- Otimização de ordem (VRP/TSP) + geração de Legs + polylines
- Ingest API + armazenamento de pings (timeseries)
- Cálculo: progresso, km percorrido/restante, ETA aproximado
- Detecção: fora do corredor (Bronze default) + confirmação
- Dashboard: mapa em tempo real + lista de alertas + detalhe da viagem
- Push de alertas (mínimo: WS + email)

### Fase 1.1 — “Bom o bastante” em produção

- Ping adaptativo (Bronze -> Silver -> Gold em suspeita)
- Detour (tempo/distância) sob demanda (sem explodir custo)
- Reprocessamento de trilha e relatórios
- Limites por plano (veículos, pings/min, alertas)

### Fase 2 — Opção 2 (navegação embutida)

- SDK de navegação no app do motorista (**Mapbox Navigation SDK** ou Google Navigation)
- Reroute controlado + melhor telemetria
- Offline parcial (fila local de pings e sync)
- Políticas: rota obrigatória/compliance

---

## 8) Definição de pronto (Definition of Done)

Para uma feature ser considerada pronta:

- **tem testes automatizados** cobrindo o comportamento (unit e/ou integration),
- tem contratos (DTO/schema) e versionamento quando necessário,
- tem teste unitário do core (geo/detecção),
- logs estruturados (inclui `tenant_id`, `trip_id`, `vehicle_id`),
- inclui métricas mínimas (latência ingest, tamanho fila, taxa de alertas),
- não quebra multi-tenant (scoping/rls).

---

## 9) Docker-first (local dev e caminho para escala)

### Princípio

- Tudo roda via **Docker** localmente (ambiente previsível) e evolui para deploy escalável.
- O host só precisa de: Docker + Node + pnpm (ou usar devcontainer).

### Containers mínimos (MVP)

- `postgres-postgis` (RDS compatível)
- `redis`
- `api`
- `ingest`
- `worker`
- `realtime`
- `web-dashboard` (opcional rodar fora do Docker no início)

### Comandos padrão

- `docker compose up -d` (subir infra)
- `pnpm install`
- `pnpm -r test` (obrigatório antes de subir serviços)
- `pnpm -r dev` (dev servers)

### Regras Docker

- Imagens **multi-stage** (build separado de runtime)
- Nada de segredo em imagem; usar env vars/secret manager
- Healthchecks em todos os serviços
- Versionar `docker/` e `compose.yml` como parte do produto

---

## 10) Regras para Codex/Agentes (como gerar código aqui dentro)

Quando um agente for implementar algo:

1. **Comece pelo contrato** (DTOs/schemas) em `packages/contracts`.
2. Implemente **utils geoespaciais** em `packages/shared/geo` com testes.
3. No backend, prefira:
   - handlers puros + services injetáveis
   - jobs assíncronos para tudo que não for resposta imediata do ingest
4. Não “inventar” nomes: usar as entidades/paths definidos acima.
5. Sempre incluir:
   - migrations (quando mexer em schema),
   - testes do core,
   - observabilidade (logs + métricas).

---

## 13) Sprint 2 — MVP Core (Trip/Stops/Rotas)

### Objetivo

Fechar domínio de viagens/paradas/pernas e geração de rota para alimentar tracking.

### Status de execução (atual)

- [x] `S2-001` Criar módulos `Trip`, `Stop`, `Leg`, `RoutePlan`, `RouteTrack` no `services/api`.
- [x] `S2-002` Expandir schema Prisma com entidades de viagem + migration SQL inicial.
- [x] `S2-003` Criar migration SQL para índices geoespaciais essenciais.
- [x] `S2-004` Criar seed de dados para trips/stops demo (idempotente, com dry-run e testes).
- [x] `S2-005` Definir `TripDTO/StopDTO/LegDTO` versionados (`v1`) em `packages/contracts`.
- [x] `S2-006` Adicionar testes de contrato com snapshots estáveis para DTOs de viagem.
- [ ] `S2-007` em diante (pendente).

### Mudanças importantes em APIs/interfaces/tipos públicos (Sprint 2-4)

1. `POST /api/v1/trips`
2. `POST /api/v1/trips/:tripId/stops/optimize`
3. `GET /api/v1/trips/:tripId`
4. `POST /api/v1/trips/:tripId/start`
5. `GET /api/v1/trips/:tripId/progress` (solidificado com cálculo real)
6. `GET /api/v1/alerts` (filtros por tenant/trip/severidade/status)
7. `GET /ops/release-status` (finalizado para operação local)
8. WebSocket channels `trip.progress.v1` e `alert.event.v1`
9. Contratos `TripDTO`, `StopDTO`, `LegDTO`, `RoutePlanDTO`, `RouteTrackDTO`, `AlertEventV1`, `ReleaseStatusDTO`
10. Interface `MapProvider` com modo `mock` e `mapbox` via feature flag (`MAP_PROVIDER_MODE`)

### Backlog granular (Sprint 2)

| ID     | Tarefa                                                                           | Estimativa | Dependência        | Critério de aceite               |
| ------ | -------------------------------------------------------------------------------- | ---------: | ------------------ | -------------------------------- |
| S2-001 | Criar módulos `Trip`, `Stop`, `Leg`, `RoutePlan`, `RouteTrack` no `services/api` |         2h | Sprint 1 API base  | módulos compilam e sobem         |
| S2-002 | Expandir schema Prisma com entidades de viagem                                   |         2h | S2-001             | migração gerada sem erro         |
| S2-003 | Criar migrations SQL para índices geoespaciais essenciais                        |       1.5h | S2-002             | índices aplicados                |
| S2-004 | Criar seed de dados para trips/stops demo                                        |         1h | S2-002             | seed reproduzível                |
| S2-005 | Definir `TripDTO/StopDTO/LegDTO` em `packages/contracts`                         |       1.5h | S2-001             | schemas versionados              |
| S2-006 | Testes de contrato para DTOs de viagem                                           |         1h | S2-005             | snapshots estáveis               |
| S2-007 | Implementar `POST /api/v1/trips`                                                 |       1.5h | S2-002,S2-005      | cria trip com tenant scoping     |
| S2-008 | Implementar `GET /api/v1/trips/:tripId`                                          |         1h | S2-007             | retorno consistente com contrato |
| S2-009 | Implementar `POST /api/v1/trips/:tripId/stops/optimize`                          |         2h | S2-007             | retorna ordem otimizada          |
| S2-010 | Implementar geração de `Legs` com polyline e métricas                            |         2h | S2-009             | legs persistidas                 |
| S2-011 | Criar `MapProvider` runtime selector (`mock`/`mapbox`)                           |       1.5h | Sprint 1 contratos | troca por env var                |
| S2-012 | Implementar `MapboxProvider` mínimo (directions/geocoding)                       |         2h | S2-011             | integração funcional             |
| S2-013 | Implementar fallback mock quando token ausente                                   |         1h | S2-011             | dev local não bloqueia           |
| S2-014 | Endpoint `POST /api/v1/trips/:tripId/start`                                      |         1h | S2-010             | status da trip muda para ativa   |
| S2-015 | Gerador de deep links (Google/Waze) para próxima parada                          |         1h | S2-010             | link válido por leg              |
| S2-016 | Persistir baseline de ETA/distância planejada por leg                            |         1h | S2-010             | dados base para detour           |
| S2-017 | Testes integração fluxo criar trip -> otimizar -> gerar legs                     |         2h | S2-007..S2-016     | fluxo e2e backend verde          |
| S2-018 | Logs estruturados de viagem (`tenant_id/trip_id`)                                |       0.5h | S2-007             | logs rastreáveis                 |
| S2-019 | Métricas de latência endpoints de trips                                          |       0.5h | S2-007             | métrica exportada                |
| S2-020 | Documentar API de trips no MD                                                    |         1h | S2-005..S2-014     | contratos e exemplos registrados |

### Critério de conclusão da Sprint 2

1. Trip com múltiplas paradas criada, otimizada e iniciada.
2. Legs com polyline e baseline ETA/distância persistidas.
3. Deep link da próxima parada disponível.
4. Testes unit/integração de domínio e contratos verdes.

---

## 14) Sprint 3 — Tracking + Alertas + Dashboard

### Objetivo

Fechar fluxo de operação em tempo real (ingest -> detecção -> evento -> dashboard).

### Backlog granular (Sprint 3)

| ID     | Tarefa                                                        | Estimativa | Dependência     | Critério de aceite              |
| ------ | ------------------------------------------------------------- | ---------: | --------------- | ------------------------------- |
| S3-001 | Consolidar tiers Bronze/Silver/Gold em config versionada      |         1h | Sprint 1 ingest | thresholds centralizados        |
| S3-002 | Implementar máquina de estado `normal/suspeita/confirmado`    |         2h | S3-001          | transições testadas             |
| S3-003 | Filtro anti-ruído por `accuracy_m`                            |         1h | S3-002          | ruído não gera alerta imediato  |
| S3-004 | Cálculo real de progresso sobre polyline                      |         2h | Sprint 2 legs   | progresso consistente           |
| S3-005 | Cálculo km percorrido/restante por trip ativa                 |         1h | S3-004          | valores no endpoint             |
| S3-006 | Cálculo ETA aproximado atualizado por ping                    |       1.5h | S3-004          | ETA disponível                  |
| S3-007 | Finalizar `GET /api/v1/trips/:tripId/progress`                |         1h | S3-004..S3-006  | resposta final contratada       |
| S3-008 | Emitir evento `off_route.suspected.v1`                        |         1h | S3-002          | evento versionado               |
| S3-009 | Emitir evento `off_route.confirmed.v1`                        |         1h | S3-002          | evento versionado               |
| S3-010 | Emitir evento `back_on_route.v1`                              |         1h | S3-002          | retorno de rota detectado       |
| S3-011 | Criar `GET /api/v1/alerts` com filtros                        |       1.5h | S3-008..S3-010  | lista de alertas funcional      |
| S3-012 | Publicar canais WS `trip.progress.v1` e `alert.event.v1`      |       1.5h | S3-007..S3-010  | stream ativo                    |
| S3-013 | Tela dashboard `trips` com status em tempo real               |         2h | Sprint 1 web    | lista ao vivo                   |
| S3-014 | Tela detalhe da viagem com progresso e ETA                    |         2h | S3-007,S3-012   | detalhe funcional               |
| S3-015 | Tela `alerts` com filtros básicos                             |       1.5h | S3-011          | operação de alertas funcional   |
| S3-016 | Integrar mapa em tempo real no dashboard (Mapbox GL)          |         2h | S3-013          | rota + posição atual            |
| S3-017 | Mecanismo mínimo de envio email para alertas confirmados      |       1.5h | S3-009          | envio assíncrono funcionando    |
| S3-018 | Testes integração ingest -> worker -> ws -> dashboard payload |         2h | S3-012          | contrato ponta-a-ponta validado |
| S3-019 | Testes unitários regras Bronze e confirmação temporal         |       1.5h | S3-002          | regras sem regressão            |
| S3-020 | Documentar fluxo operacional em `Codex-TNS.md`                |         1h | S3-001..S3-017  | guia atualizado                 |

### Critério de conclusão da Sprint 3

1. Fluxo real-time completo disponível no dashboard.
2. Alertas suspeito/confirmado/back-on-route emitidos e listáveis.
3. Progresso, km e ETA disponíveis por trip.
4. Contratos WS/API cobertos por testes.

---

## 15) Sprint 4 — Deploy Local RC + AWS Staging-Ready

### Objetivo

Colocar o sistema em estado de release local confiável e com trilha pronta para staging AWS.

### Backlog granular (Sprint 4)

| ID     | Tarefa                                                               | Estimativa | Dependência    | Critério de aceite          |
| ------ | -------------------------------------------------------------------- | ---------: | -------------- | --------------------------- |
| S4-001 | Revisar Dockerfiles multi-stage de todos serviços                    |       1.5h | Sprints 1-3    | imagens estáveis            |
| S4-002 | Ajustar `compose.yml` com profiles (`core`, `full`)                  |         1h | S4-001         | subida por perfil           |
| S4-003 | Adicionar healthchecks finais (api/ingest/worker/ws/web/db/redis)    |         1h | S4-002         | status saudável             |
| S4-004 | Padronizar variáveis de ambiente por serviço                         |         1h | S4-002         | `.env.example` completo     |
| S4-005 | Implementar readiness endpoint por serviço                           |         1h | S4-003         | readiness consultável       |
| S4-006 | Finalizar `GET /ops/release-status` (version, commit, env, health)   |         1h | S4-005         | payload completo            |
| S4-007 | Finalizar tela `/deploy` consumindo release-status                   |         1h | S4-006         | tela operacional            |
| S4-008 | Incluir links de runbook/logs na `/deploy`                           |       0.5h | S4-007         | operação guiada             |
| S4-009 | Criar workflow CI `build-and-test` com matriz de serviços            |       1.5h | Sprint 1 CI    | pipeline consistente        |
| S4-010 | Criar workflow `docker-build` para imagens tagged por commit         |       1.5h | S4-009         | artefatos versionados       |
| S4-011 | Configurar scan Trivy nas imagens geradas                            |       0.5h | S4-010         | relatório de segurança      |
| S4-012 | Configurar gates finais (lint/typecheck/test/security High/Critical) |         1h | S4-009..011    | política aplicada           |
| S4-013 | Criar pasta `infra/terraform/staging` (skeleton)                     |         1h | S4-004         | estrutura IaC pronta        |
| S4-014 | Definir módulos placeholders `network`, `data`, `services`           |       1.5h | S4-013         | plano organizacional pronto |
| S4-015 | Criar `tfvars.example` de staging                                    |       0.5h | S4-013         | parâmetros documentados     |
| S4-016 | Mapear serviços Docker -> serviços ECS (documento de mapping)        |         1h | S4-013         | trilha de migração clara    |
| S4-017 | Criar runbook `local-release.md` (subir, validar, rollback)          |         1h | S4-002..S4-008 | operação reprodutível       |
| S4-018 | Criar runbook `staging-readiness.md` (checklist pré-AWS)             |         1h | S4-013..S4-016 | checklist fechado           |
| S4-019 | Teste de carga leve no ingest (cenário bronze)                       |         1h | Sprints 2-3    | comportamento conhecido     |
| S4-020 | Teste de chaos básico (restart worker/realtime)                      |         1h | S4-003         | recuperação validada        |
| S4-021 | Auditoria final de multi-tenant em APIs críticas                     |         1h | Sprints 2-3    | sem vazamento entre tenants |
| S4-022 | Congelar contratos v1 para release local                             |       0.5h | S3-020         | versão estável              |
| S4-023 | Checklist final Go/No-Go de deploy local                             |       0.5h | S4-001..S4-022 | release decisionável        |
| S4-024 | Registrar retro técnica e backlog pós-deploy                         |       0.5h | fim sprint     | próximos passos definidos   |

### Critério de conclusão da Sprint 4

1. `docker compose --profile full up -d` sobe stack completa sem erro crítico.
2. Tela `/deploy` mostra estado operacional real.
3. Pipelines de CI e build de imagem estáveis.
4. Runbooks de operação local e readiness de staging prontos.
5. Checklist Go/No-Go aprovado.

---

## 16) Critérios de Go/No-Go de Deploy

1. Todos serviços `healthy` por pelo menos 30 minutos em execução contínua.
2. Fluxo ponta-a-ponta validado: `trip criada -> pings -> alerta -> dashboard`.
3. Zero falhas `High/Critical` nos scans obrigatórios.
4. `pnpm -r test` e integrações críticas com sucesso.
5. `/deploy` consistente com estado real.
6. Logs com `tenant_id/trip_id/vehicle_id` nos fluxos críticos.

---

## 17) Riscos, Mitigações e Itens Pós-Deploy

### Riscos principais

1. Custo e latência de chamadas de mapas acima do previsto.
2. Falso positivo em detecção de desvio por ruído de GPS.
3. Gargalo no ingest/worker com aumento de pings.
4. Regressões de isolamento multi-tenant.
5. Instabilidade de serviços em reinício local.

### Mitigações

1. `MapProvider` com modo `mock`/`mapbox`, cache e fallback para reduzir custo.
2. Filtro por `accuracy_m` + confirmação por janela antes de alerta confirmado.
3. Rate limit por tenant + fila assíncrona + testes de carga leve por sprint.
4. Testes de integração específicos para `tenant_id` em endpoints críticos.
5. Healthchecks + runbook de rollback + teste de chaos básico.

### Itens pós-deploy local (próxima etapa)

1. Aplicar Terraform de staging AWS (`network/data/services`) com segredos gerenciados.
2. Publicar imagens em registry e amarrar pipeline de promoção para staging.
3. Implementar detour (tempo/distância) em produção com controle de custo.
4. Evoluir alertas para push/SMS por plano.
5. Iniciar `driver-mobile` (integração real de ping/deep link) após estabilização do backend.
