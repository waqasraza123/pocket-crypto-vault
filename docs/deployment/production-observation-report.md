# Pocket Vault Production Observation Report

## Purpose
The production observation report records the first post-activation operating window after traffic is live and an activation record is accepted.

It does not deploy infrastructure, mutate a database, move traffic, submit mobile builds, send chain transactions, or invite users. It reads public `/health` and `/ready`, records operator-owned support, indexer, analytics, error budget, failed transaction, and incident signals, and writes a JSON artifact that decides whether beta expansion can continue.

## Files
- `scripts/write-production-observation-report.mjs`
  - validates target, label, status, persistence driver, API URL, accepted activation record, support reference, incident owner, observation window, and operational signals
  - reads public `/health` and `/ready` with a bounded timeout
  - inspects a runner-local production activation record when a path is provided
  - requires clean operational signals when `PRODUCTION_OBSERVATION_STATUS=stable`
  - writes a JSON observation report with checks, signals, acceptance gates, next actions, and git metadata
- `.github/workflows/production-observation-report.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - requires `confirm_observe=observe`
  - uploads the production observation report artifact
- `package.json`
  - exposes `pnpm production:observation:report`

## Required Inputs
- `PRODUCTION_OBSERVATION_TARGET`
  - `staging` or `production`
- `PRODUCTION_OBSERVATION_LABEL`
  - stable observation label
- `PRODUCTION_OBSERVATION_STATUS`
  - `stable`, `degraded`, or `incident`
  - defaults to `stable`
- `PRODUCTION_OBSERVATION_PERSISTENCE_DRIVER`
  - `sqlite` or `postgresql`
  - defaults to `postgresql`
- `PRODUCTION_OBSERVATION_API_BASE_URL`
- `PRODUCTION_OBSERVATION_ACTIVATION_RECORD`
- `PRODUCTION_OBSERVATION_SUPPORT_REFERENCE`
- `PRODUCTION_OBSERVATION_INCIDENT_OWNER`
- `PRODUCTION_OBSERVATION_CONFIRM=observe`

Operational signal inputs:

- `PRODUCTION_OBSERVATION_INDEXER_STATUS`
  - `healthy`, `lagging`, `disabled`, or `unknown`
- `PRODUCTION_OBSERVATION_SUPPORT_STATUS`
  - `quiet`, `active`, `blocked`, or `unknown`
- `PRODUCTION_OBSERVATION_ANALYTICS_STATUS`
  - `healthy`, `degraded`, `disabled`, or `unknown`
- `PRODUCTION_OBSERVATION_ERROR_BUDGET_STATUS`
  - `within-budget`, `watch`, `breached`, or `unknown`
- `PRODUCTION_OBSERVATION_SUPPORT_REQUEST_COUNT`
- `PRODUCTION_OBSERVATION_FAILED_TRANSACTION_COUNT`
- `PRODUCTION_OBSERVATION_INCIDENT_COUNT`

Optional inputs:

- `PRODUCTION_OBSERVATION_MINUTES`
- `PRODUCTION_OBSERVATION_TIMEOUT_MS`
- `PRODUCTION_OBSERVATION_INCIDENT_REFERENCE`
  - required when status is `incident`
- `PRODUCTION_OBSERVATION_OPERATOR`
- `PRODUCTION_OBSERVATION_NOTES`
- `PRODUCTION_OBSERVATION_DIR`

## Stable Gate
`PRODUCTION_OBSERVATION_STATUS=stable` requires:

- public `/health` is healthy
- public `/ready` is healthy
- accepted production activation record
- `PRODUCTION_OBSERVATION_INDEXER_STATUS=healthy`
- `PRODUCTION_OBSERVATION_SUPPORT_STATUS` is not `blocked`
- `PRODUCTION_OBSERVATION_ANALYTICS_STATUS` is not `degraded`
- `PRODUCTION_OBSERVATION_ERROR_BUDGET_STATUS=within-budget`
- `PRODUCTION_OBSERVATION_INCIDENT_COUNT=0`

Use `degraded` when the product remains live but a signal needs operator review before expanding beta. Use `incident` when an incident record is open or should be opened.

## Evidence Checks
When the activation record points to a local JSON file, the script validates:

- app is `pocket-vault`
- component is `production-activation-record`
- target matches the observation target
- activation outcome is `accepted`
- persistence driver matches the observation driver
- non-mutating artifact boundaries are preserved
- support reference and incident owner are present

Remote URLs and artifact names remain valid references but are recorded as not locally inspected. Operators must review them before relying on the observation result.

## Secret Boundary
Do not place RPC URLs, `API_DATABASE_URL`, internal API tokens, wallet project secrets, private keys, EAS tokens, Vercel tokens, or provider credentials in observation inputs.

The script rejects obvious credential strings and PostgreSQL connection strings. Observation reports should contain public URLs, artifact references, support queue references, incident references, owner labels, and redacted operational signals only.

## Local Usage
Example stable observation:

```bash
PRODUCTION_OBSERVATION_TARGET=production \
PRODUCTION_OBSERVATION_LABEL=v1-limited-beta-wave-1 \
PRODUCTION_OBSERVATION_STATUS=stable \
PRODUCTION_OBSERVATION_PERSISTENCE_DRIVER=postgresql \
PRODUCTION_OBSERVATION_API_BASE_URL=https://api.pocket-vault.example.com \
PRODUCTION_OBSERVATION_ACTIVATION_RECORD=./artifacts/production-activation.json \
PRODUCTION_OBSERVATION_INDEXER_STATUS=healthy \
PRODUCTION_OBSERVATION_SUPPORT_STATUS=quiet \
PRODUCTION_OBSERVATION_ANALYTICS_STATUS=healthy \
PRODUCTION_OBSERVATION_ERROR_BUDGET_STATUS=within-budget \
PRODUCTION_OBSERVATION_SUPPORT_REQUEST_COUNT=0 \
PRODUCTION_OBSERVATION_FAILED_TRANSACTION_COUNT=0 \
PRODUCTION_OBSERVATION_INCIDENT_COUNT=0 \
PRODUCTION_OBSERVATION_SUPPORT_REFERENCE=/support \
PRODUCTION_OBSERVATION_INCIDENT_OWNER=operations \
PRODUCTION_OBSERVATION_CONFIRM=observe \
pnpm production:observation:report
```

## GitHub Usage
1. Run `Production Observation Report`.
2. Select `staging` or `production`.
3. Provide the accepted activation record, public API URL, support reference, incident owner, and operational signals.
4. Set `confirm_observe` to `observe`.
5. Download the uploaded observation report artifact.
6. Store the observation report with activation evidence before expanding beta invitations.

## Boundary
This report is not monitoring infrastructure. It is an operator acceptance artifact for a specific observation window. A stable report can support limited beta continuation, while degraded and incident reports should pause beta expansion until a follow-up observation is clean.
