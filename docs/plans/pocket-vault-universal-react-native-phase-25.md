# Pocket Vault Universal React Native Phase 25

## Objective
Add a provider-neutral managed database planning workflow so the current SQLite-backed API persistence layer can be moved toward external PostgreSQL infrastructure without choosing a provider or touching live data.

## Implemented Scope
- Added `scripts/write-api-managed-database-plan.mjs`.
- Added `pnpm api:database:plan`.
- Added a manual `API Managed Database Plan` GitHub Actions workflow.
- Added a deployment runbook for managed database planning.
- Updated release, launch, env, README, and repo-state documentation.

## Plan Behavior
The managed database plan generator:

- validates target as `staging` or `production`
- validates engine as `postgresql`
- validates cutover strategy as `cold-cutover` or `shadow-restore`
- requires source and rollback snapshot references
- requires a non-secret managed database target reference
- rejects target references that look like connection strings or credentials
- records current SQLite schema inventory
- records data classification and migration requirements
- writes a JSON artifact with `noDatabaseMutated: true`

## Current Schema Inventory
The plan records:

- `goal-vault-indexer.sqlite`
  - `vaults`
  - `vault_events`
  - `sync_states`
- `goal-vault-analytics.sqlite`
  - `analytics_events`

The inventory includes table columns, primary keys, indexes, and private-metadata classification.

## Current Boundary
This phase does not provision a database, add a database driver, create schemas, copy rows, run parity checks, run migrations, deploy the API, restore data, run tests, run builds, or move traffic.

## Follow-Up
- Select a managed PostgreSQL provider and credential model.
- Add a persistence adapter boundary before replacing the SQLite store implementation.
- Add schema creation and parity tooling after the provider and driver are selected.
- Keep managed database plans beside API data snapshots, preflight reports, release manifests, and API traffic plans.
