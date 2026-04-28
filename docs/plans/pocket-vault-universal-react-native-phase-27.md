# Pocket Vault Universal React Native Phase 27

## Objective
Add a provider-neutral managed database parity plan so operators have a reviewable comparison contract before promoting a PostgreSQL-backed API runtime.

## Implemented Scope
- Added `scripts/write-api-managed-database-parity-plan.mjs`.
- Added `pnpm api:database:parity`.
- Added a manual `API Managed Database Parity` GitHub Actions workflow.
- Added a deployment runbook for parity planning.
- Updated release, launch, env, README, and repo-state documentation.

## Parity Plan Behavior
The parity generator:

- validates target as `staging` or `production`
- validates engine as `postgresql`
- validates mode as `restore-validation`, `pre-traffic`, or `post-rollback`
- requires source snapshot and schema manifest references
- requires a non-secret managed database target reference
- rejects target references that look like connection strings or credentials
- emits SQLite source queries and PostgreSQL target queries for key parity checks
- writes a JSON artifact with `noDatabaseConnected: true` and `noDataCompared: true`

## Current Boundary
This phase does not connect to SQLite, connect to PostgreSQL, run queries, compare rows, copy data, apply DDL, add a database driver, change runtime storage, run tests, run builds, or move traffic.

## Follow-Up
- Add live parity automation after the managed database provider, credential model, and driver are selected.
- Keep parity plans beside managed database plans, schema bundles, data snapshots, API preflight reports, release manifests, and API traffic plans.
- Require parity acceptance before public traffic movement to a managed-database-backed API host.
