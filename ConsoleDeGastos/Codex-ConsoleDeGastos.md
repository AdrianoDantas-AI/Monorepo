# Codex-ConsoleDeGastos

## Objetivo

Entregar monitor de gastos e previsoes com IA e Open Finance (Pluggy).

## Modulos MVP

- Acesso Open Finance
- Dashboard
- Transacoes
- Recorrentes
- Fluxo de Caixa
- Contas e Faturas
- Categorias
- Projecao
- Patrimonio
- Relatorios
- Assistente IA com confirmacao de acoes

## Guardrails

- Unit e integration obrigatorios em toda mudanca.
- Fluxo OpenSpec obrigatorio para mudancas relevantes.

## Infra local

- Stack completa (`postgres`, `redis`, `api`, `web`, `mobile-preview`) via `infra/docker/compose.yml`.
- Persistencia da API controlada por `PERSISTENCE_MODE` e `DATABASE_URL`.
