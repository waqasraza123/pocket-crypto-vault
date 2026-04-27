# Goal Vault Universal React Native Phase 29

## Objective
Add a provider-neutral managed database import plan so reviewed JSONL export bundles can produce auditable PostgreSQL import SQL without connecting to a live database.

## Implemented Scope
- Added `scripts/write-api-managed-database-import-plan.mjs`.
- Added `pnpm api:database:import:plan`.
- Added a manual `API Managed Database Import Plan` GitHub Actions workflow.
- Added a deployment runbook for import plans and generated SQL.
- Updated release, launch, env, README, and repo-state documentation.

## Import Plan Behavior
The import plan script:

- validates target as `staging` or `production`
- validates engine as `postgresql`
- validates mode as `initial-import`, `retry-import`, or `rollback-restore`
- rejects target references that look like connection strings or credentials
- reads a managed database export manifest
- verifies JSONL file byte counts, row counts, and SHA-256 checksums
- writes a psql-compatible import SQL artifact
- writes an import plan manifest with psql variables, controls, rollback triggers, and artifact references
- writes artifacts with `noDatabaseConnected: true` and `noDataImported: true`

The GitHub workflow accepts either a prior export artifact plus its workflow run ID or a runner-local export path. Artifact-based import plans require the run ID so the source export is pinned to an auditable workflow run.

## Current Boundary
This phase does not connect to PostgreSQL, use credentials, apply schema, import rows, run parity checks, add a database driver, change runtime storage, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Add provider-specific import execution tooling after the managed database provider, credential model, and driver are selected.
- Add live parity automation after import execution exists.
- Add managed database runtime adapters only after provider-backed import and rollback procedures are accepted.
