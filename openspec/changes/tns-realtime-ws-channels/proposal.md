## Why

A Sprint 3 exige stream em tempo real para progresso de viagem e eventos de alerta.

## What Changes

- Publicar canais WebSocket `trip.progress.v1` e `alert.event.v1` no serviço `realtime`.
- Implementar runtime com assinaturas por canal/tenant e publicação de eventos.
- Adicionar endpoint operacional para publicar eventos de teste no canal (`/ops/publish`).
- Cobrir com testes unit e integração.

## Impact

- Entrega `S3-012`.
- Base pronta para consumo do dashboard em tempo real (`S3-013`/`S3-014`/`S3-015`).
