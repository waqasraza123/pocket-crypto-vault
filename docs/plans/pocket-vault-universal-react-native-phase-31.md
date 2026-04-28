# Pocket Vault Universal React Native Phase 31

## Objective
Add an API persistence store boundary so SQLite store construction is centralized before any future PostgreSQL adapter work.

## Implemented Scope
- Added `createApiPersistenceStores` in `apps/api/src/modules/persistence/stores.ts`.
- Centralized construction of the indexer and analytics stores behind the API persistence runtime config.
- Threaded the analytics store through `IndexerContext` instead of constructing it inside the analytics route module.
- Kept SQLite as the only runtime-ready store implementation.
- Kept PostgreSQL blocked by the existing persistence guardrail.
- Updated persistence runtime, README, and repo-state documentation.

## Runtime Behavior
Current release behavior:

- `createIndexerContext` creates persistence stores through one factory.
- `API_PERSISTENCE_DRIVER=sqlite` constructs `IndexerStore` and `AnalyticsStore` from `API_DATA_DIR`.
- `API_PERSISTENCE_DRIVER=postgresql` cannot create stores because runtime validation remains blocked.
- routes and services receive stores through context rather than constructing analytics storage directly.

## Current Boundary
This phase does not implement PostgreSQL persistence, add a database driver, change SQLite schemas, run migrations, execute imports, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Define narrower store interfaces before adding a second adapter.
- Add a PostgreSQL-backed implementation only after provider credentials, import, rollback, and parity procedures are accepted.
- Keep route modules consuming context-owned stores instead of constructing persistence adapters directly.
