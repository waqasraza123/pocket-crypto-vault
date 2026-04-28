# Pocket Vault Universal React Native Phase 35

## Objective
Add a provider-neutral managed database runtime activation planning workflow before PostgreSQL runtime mode is enabled.

## Implemented Scope
- Added `scripts/write-api-managed-database-runtime-plan.mjs`.
- Added `pnpm api:database:runtime:plan`.
- Added `.github/workflows/api-managed-database-runtime-plan.yml`.
- Added `docs/deployment/api-managed-database-runtime-plan.md`.
- Updated README, persistence runtime docs, CI/release workflow docs, and repo memory.

## Runtime Behavior
Current release behavior is unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- `API_PERSISTENCE_DRIVER=postgresql` remains blocked by runtime validation and preflight.
- no PostgreSQL driver, connection pool, credential loading, factory wiring, schema execution, import execution, parity execution, deployment, or traffic movement was added.

## Artifact Behavior
The runtime plan script validates non-secret activation evidence:

- target environment
- runtime mode: `shadow`, `cutover`, or `rollback-drill`
- managed database target reference
- PostgreSQL schema name
- planned driver package label
- managed database plan, schema, export, import, parity, preflight, release manifest, traffic plan, snapshot, and image references

The generated JSON records required acceptance gates, runtime steps, rollback steps, required secret classes, and blocked-until conditions.

## Current Boundary
This phase creates only a reviewable planning artifact. It does not connect to PostgreSQL, add a database dependency, change API startup, relax runtime guardrails, mutate data, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Add a provider-approved PostgreSQL driver and connection pool.
- Wire `PostgresqlIndexerStore` and `PostgresqlAnalyticsStore` through `createApiPersistenceStores`.
- Update preflight and runtime validation only after the runtime activation artifact, rollback plan, and parity acceptance are reviewed.
