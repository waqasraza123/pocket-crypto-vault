# Pocket Vault API Preflight

## Purpose
The API runtime preflight validates that staging or production backend configuration is coherent before an operator deploys or promotes the API.

It does not start the server, connect to RPC providers, run database migrations, build images, deploy infrastructure, or move traffic. It reads the same runtime environment parser used by the Fastify API, adds target-chain readiness checks, optionally checks PostgreSQL connectivity and schema presence when PostgreSQL mode is selected, and writes a redacted JSON report that can be attached to a release record.

## Files
- `apps/api/src/jobs/runtime-preflight.ts`
  - reads API runtime configuration through `readApiRuntimeEnv`
  - validates target-chain RPC and factory configuration
  - validates persistence driver selection
  - checks PostgreSQL connection and expected schema tables when `API_PERSISTENCE_DRIVER=postgresql`
  - reports production activation gates for database cutover, rollback, protected smoke, support, analytics, and limited beta scope
  - reports redacted persistence runtime capabilities and PostgreSQL activation blockers
  - reports booleans for secrets instead of printing secret values
  - writes a JSON preflight report
  - exits nonzero when runtime validation fails
- `apps/api/package.json`
  - exposes `pnpm --filter @pocket-vault/api preflight`
- `package.json`
  - exposes `pnpm api:preflight`
- `.github/workflows/api-preflight.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - uploads the preflight report artifact even when validation fails

## Local Usage
Set the intended runtime variables, then run:

```bash
pnpm api:preflight
```

Optional output override:

```bash
API_PREFLIGHT_OUTPUT=artifacts/pocket-vault-api-preflight-staging.json pnpm api:preflight
```

The default local output is:

```text
artifacts/pocket-vault-api-preflight.json
```

## GitHub Workflow Usage
Run the `API Preflight` workflow manually:

- `target`: `staging` or `production`

The workflow reads public values from the selected GitHub Environment variables and sensitive values from the selected GitHub Environment secrets.

## Required GitHub Environment Values
Variables:

- `API_PUBLIC_BASE_URL`
- `API_HOST`
- `API_PORT`
- `API_DATA_DIR`
- `API_PERSISTENCE_DRIVER`
- `API_SYNC_INTERVAL_MS`
- `API_ENABLE_INDEXER`
- `API_ENABLE_ANALYTICS`
- `API_ENABLE_SUPPORT`
- `API_ROLLBACK_EVIDENCE_ACCEPTED`
- `API_SMOKE_EVIDENCE_ACCEPTED`
- `API_LIMITED_BETA_SCOPE_APPROVED`
- `API_SIGNED_REQUEST_MAX_AGE_SECONDS`
- `API_LOG_LEVEL`
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
- `API_BASE_START_BLOCK`
- `API_BASE_SEPOLIA_START_BLOCK`

PostgreSQL-only variables:

- `API_POSTGRES_DRIVER`
- `API_PERSISTENCE_SCHEMA_NAME`

Secrets:

- `API_INTERNAL_TOKEN`
- `EXPO_PUBLIC_BASE_RPC_URL`
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`

PostgreSQL-only secrets:

- `API_DATABASE_URL`

The workflow defaults safe operational values for optional knobs, but staging and production still require:

- HTTPS `API_PUBLIC_BASE_URL`
- configured `API_INTERNAL_TOKEN`
- Base Sepolia RPC and factory for staging
- Base mainnet RPC and factory for production

## Report Contents
The preflight report records:

- target environment and deployment target
- public API base URL
- host, port, and data directory path
- whether the data directory currently exists
- selected persistence driver
- selected PostgreSQL client driver
- SQLite data directory
- whether `API_DATABASE_URL` is configured
- PostgreSQL schema name selected for future managed database runtime
- whether the selected persistence runtime is ready
- production activation gate status and `safeForLimitedBetaTraffic`
- PostgreSQL connection check status when PostgreSQL mode is selected
- PostgreSQL schema check status and missing table names when PostgreSQL mode is selected
- persistence runtime capabilities:
  - SQLite runtime readiness
  - asynchronous store port readiness
  - PostgreSQL store core readiness
  - PostgreSQL transaction boundary readiness
  - PostgreSQL pooled executor boundary readiness
  - lifecycle shutdown readiness
  - PostgreSQL driver adapter readiness
  - Neon PostgreSQL driver adapter readiness
  - PostgreSQL store factory wiring readiness
  - PostgreSQL preflight connection-check readiness
  - PostgreSQL runtime readiness
  - redacted blocker messages for incomplete PostgreSQL activation gates
- sync interval, indexer mode, analytics mode, and log level
- whether the internal token is configured
- signed request maximum age
- primary chain ID for the target
- per-chain RPC configured status
- per-chain factory configured status and factory address
- validation errors

The report does not include RPC URLs, internal API tokens, private keys, EAS tokens, or wallet project secrets.

## Promotion Use
Use this gate before deploying or promoting a backend image:

1. Configure the target GitHub Environment variables and secrets.
2. Run `API Preflight` for the target.
3. Download the preflight report artifact.
4. Fix any validation errors before deploying the API image.
5. Keep the passing report with the API image manifest, managed database plan when applicable, release manifest, and API traffic plan.
6. For managed database runtime cutover planning, prefer passing the downloaded JSON file path to `API_DATABASE_RUNTIME_PREFLIGHT_REPORT` so the runtime plan script can inspect PostgreSQL capability evidence locally.

## Failure Handling
If the workflow fails, download the uploaded report and inspect `validationErrors`.

Common failures:

- `API_PUBLIC_BASE_URL` missing or not HTTPS outside development
- `API_INTERNAL_TOKEN` missing outside development
- target-chain RPC URL missing
- target-chain factory address missing or invalid
- `APP_ENV` and `EXPO_PUBLIC_APP_ENV` mismatch
- malformed numeric or boolean env values
- unsupported `API_POSTGRES_DRIVER`
- `API_DATABASE_URL` missing when `API_PERSISTENCE_DRIVER=postgresql`
- `API_DATABASE_URL`, `API_POSTGRES_DRIVER`, or `API_PERSISTENCE_SCHEMA_NAME` configured while SQLite mode is active
- production runtime using SQLite
- PostgreSQL connection failure
- PostgreSQL schema missing `vaults`, `vault_events`, `sync_states`, `analytics_events`, or `support_requests`

## Boundary
This preflight closes a promotion-readiness gap without selecting a hosting provider. Provider-specific deploy, traffic shifting, rollback automation, and managed database infrastructure remain deferred.
