## Why

O endpoint de progresso já calcula distância e ETA, mas ainda falta consolidar contrato versionado para consumo estável.

## What Changes

- Definir `TripProgressDTO` v1 em `packages/contracts`.
- Validar payload de `/api/v1/trips/:tripId/progress` contra o contrato versionado nos testes.
- Ajustar documentação de sprint para marcar `S3-007` como concluído.

## Impact

- Fecha o `S3-007` com resposta formal e testável.
- Reduz risco de regressão de contrato nas próximas evoluções (`WS`, dashboard e alertas).
