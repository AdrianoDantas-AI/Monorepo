## Why

A Sprint 3 depende de thresholds consistentes por tier (`gold/silver/bronze`) para regras de detecção, confirmação e anti-ruído.

## What Changes

- Criar contrato versionado `v1` para configuração de tiers de detecção.
- Centralizar thresholds de ping, corredor, confirmação, accuracy degradado e detour.
- Expor helper para resolver configuração por tier.
- Cobrir com testes unit e integration.

## Impact

- Bronze/Silver/Gold deixam de ser apenas texto em documentação.
- Próximas tasks de detecção (`S3-002+`) passam a consumir fonte única de configuração.
