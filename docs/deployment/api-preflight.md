# Goal Vault API Preflight

## Purpose
The API runtime preflight validates that staging or production backend configuration is coherent before an operator deploys or promotes the API.

It does not start the server, connect to RPC providers, run database migrations, build images, deploy infrastructure, or move traffic. It reads the same runtime environment parser used by the Fastify API, adds target-chain readiness checks, and writes a redacted JSON report that can be attached to a release record.

## Files
- `apps/api/src/jobs/runtime-preflight.ts`
  - reads API runtime configuration through `readApiRuntimeEnv`
  - validates target-chain RPC and factory configuration
  - reports booleans for secrets instead of printing secret values
  - writes a JSON preflight report
  - exits nonzero when runtime validation fails
- `apps/api/package.json`
  - exposes `pnpm --filter @goal-vault/api preflight`
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
API_PREFLIGHT_OUTPUT=artifacts/goal-vault-api-preflight-staging.json pnpm api:preflight
```

The default local output is:

```text
artifacts/goal-vault-api-preflight.json
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
- `API_SYNC_INTERVAL_MS`
- `API_ENABLE_INDEXER`
- `API_ENABLE_ANALYTICS`
- `API_SIGNED_REQUEST_MAX_AGE_SECONDS`
- `API_LOG_LEVEL`
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
- `API_BASE_START_BLOCK`
- `API_BASE_SEPOLIA_START_BLOCK`

Secrets:

- `API_INTERNAL_TOKEN`
- `EXPO_PUBLIC_BASE_RPC_URL`
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`

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
5. Keep the passing report with the API image manifest, release manifest, and API traffic plan.

## Failure Handling
If the workflow fails, download the uploaded report and inspect `validationErrors`.

Common failures:

- `API_PUBLIC_BASE_URL` missing or not HTTPS outside development
- `API_INTERNAL_TOKEN` missing outside development
- target-chain RPC URL missing
- target-chain factory address missing or invalid
- `APP_ENV` and `EXPO_PUBLIC_APP_ENV` mismatch
- malformed numeric or boolean env values

## Boundary
This preflight closes a promotion-readiness gap without selecting a hosting provider. Provider-specific deploy, traffic shifting, rollback automation, and managed database infrastructure remain deferred.
