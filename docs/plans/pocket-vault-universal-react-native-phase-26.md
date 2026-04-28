# Pocket Vault Universal React Native Phase 26

## Objective
Add a provider-neutral PostgreSQL schema bundle for the current API persistence contract so managed database work has a reviewable DDL artifact before any provider-specific migration.

## Implemented Scope
- Added `scripts/write-api-managed-database-schema.mjs`.
- Added `pnpm api:database:schema`.
- Added a manual `API Managed Database Schema` GitHub Actions workflow.
- Added a deployment runbook for the schema bundle.
- Updated release, launch, env, README, and repo-state documentation.

## Schema Bundle Behavior
The schema generator:

- validates target as `staging` or `production`
- validates engine as `postgresql`
- validates the PostgreSQL schema identifier
- writes SQL DDL for the current API persistence tables
- writes a JSON manifest with source files, table keys, indexes, and private-data classification
- writes artifacts with `noDatabaseMutated: true`

## Tables
The bundle includes:

- `vaults`
- `vault_events`
- `sync_states`
- `analytics_events`

The schema preserves the current API serialization contract by keeping atomic amounts and timestamp-like values as text.

## Current Boundary
This phase does not provision PostgreSQL, apply DDL, connect to a database, copy rows, run parity checks, add a database driver, change the API persistence adapter, run tests, run builds, or move traffic.

## Follow-Up
- Select the managed PostgreSQL provider and credential model.
- Add provider-owned schema application or migration automation.
- Add migration/parity tooling after the provider and driver are selected.
- Introduce a persistence adapter boundary before switching runtime storage away from SQLite.
