# Pocket Vault Universal React Native Phase 23

## Objective
Add a provider-neutral API runtime preflight gate so staging and production backend configuration can be validated before image deployment, release manifest creation, or traffic movement.

## Implemented Scope
- Added `apps/api/src/jobs/runtime-preflight.ts`.
- Added API package and root preflight scripts.
- Added a manual `API Preflight` GitHub Actions workflow.
- Added a deployment runbook for local and GitHub usage.
- Updated environment, launch, workflow, README, and project-state documentation.

## Runtime Preflight Behavior
The preflight job:

- reads API configuration through the existing runtime environment parser
- applies the same staging and production validation used by API startup
- requires the target primary chain to have RPC and factory configuration
- writes a redacted JSON report to `API_PREFLIGHT_OUTPUT` or a default artifact path
- exits with a nonzero status when validation errors are present

## Target Chain Rules
- `staging` uses Base Sepolia as the primary chain.
- `production` uses Base mainnet as the primary chain.
- `development` has no primary-chain requirement.

## Artifact Contract
The generated report includes:

- app and component identifiers
- status
- generated timestamp
- target environment
- public API URL
- host, port, data directory, and data-directory existence
- indexer, analytics, sync interval, signed request age, and log level
- internal token configured status
- per-chain RPC configured status
- per-chain factory configured status and factory address
- validation errors

The report excludes secret values.

## GitHub Workflow Contract
The `API Preflight` workflow:

- is manual only
- supports `staging` and `production`
- binds to the matching GitHub Environment
- reads RPC URLs and internal token from secrets
- reads public runtime values from variables
- uploads the report artifact with `if: always()`

## Current Boundary
This phase does not deploy the API image, provision hosting, run migrations, run tests, run builds, create snapshots, restore data, or promote traffic.

## Follow-Up
- Configure staging GitHub Environment values and secrets.
- Run `API Preflight` before API image deployment.
- Attach passing preflight reports to release manifests or release notes.
- Choose a backend host before adding provider-specific deployment and traffic rollback workflows.
