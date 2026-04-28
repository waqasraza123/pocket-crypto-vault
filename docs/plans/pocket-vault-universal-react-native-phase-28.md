# Pocket Vault Universal React Native Phase 28

## Objective
Add a provider-neutral managed database export bundle so API data snapshots can be converted into table-level JSONL artifacts for future PostgreSQL import tooling.

## Implemented Scope
- Added `scripts/write-api-managed-database-export.mjs`.
- Added `pnpm api:database:export`.
- Added a manual `API Managed Database Export` GitHub Actions workflow.
- Added a deployment runbook for export bundles.
- Updated release, launch, env, README, and repo-state documentation.

## Export Behavior
The exporter:

- validates target as `staging` or `production`
- validates format as `jsonl`
- reads a local snapshot manifest
- verifies snapshot checksums before export
- exports supported SQLite tables to JSONL
- writes an export manifest with row counts, bytes, and SHA-256 checksums
- writes artifacts with `noDatabaseConnected: true` and `noDataImported: true`

The GitHub workflow accepts either a prior snapshot artifact plus its workflow run ID or a runner-local snapshot path. Artifact-based exports require the run ID so the export is pinned to an auditable snapshot source.

## Current Boundary
This phase does not connect to PostgreSQL, apply schema, import rows, run parity checks, add a database driver, change runtime storage, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Add provider-specific import tooling after the managed database provider, credential model, and driver are selected.
- Add live parity automation after import tooling exists.
- Keep export bundles in approved operational storage because they can contain wallet addresses, private vault metadata, activity history, and analytics context.
