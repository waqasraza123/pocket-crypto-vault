# Pocket Vault Universal React Native Phase 32

## Objective
Define the API persistence port contract before adding any second database adapter.

## Implemented Scope
- Added `apps/api/src/modules/persistence/ports.ts` as the shared persistence contract for API storage.
- Moved persisted vault, event, and sync-state record types out of the SQLite store implementation.
- Added read/write indexer store interfaces for vaults, activity, and sync state.
- Added an analytics store interface for product event batch persistence.
- Typed `IndexerContext` and `createApiPersistenceStores` against the persistence interfaces instead of concrete SQLite classes.
- Kept `IndexerStore` as the current SQLite implementation behind the interface.
- Kept analytics ingestion using the existing SQLite-backed analytics store behind the interface.

## Runtime Behavior
Current release behavior is unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- `createApiPersistenceStores` still constructs the SQLite indexer and analytics stores.
- route and service modules consume context-owned store ports.
- PostgreSQL mode remains blocked by runtime validation and preflight.

## Adapter Contract
Future database adapters must implement:

- `ApiIndexerStore` for vault records, activity records, and sync-state records
- `ApiAnalyticsStore` for analytics batch persistence

Adapters should be wired only through `createApiPersistenceStores`. Route modules, serializers, reconciliation services, and sync services should continue to depend on the port types rather than importing database-specific implementations.

## Current Boundary
This phase does not implement PostgreSQL persistence, add a database driver, change SQLite schemas, run migrations, execute imports, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Add a PostgreSQL adapter only after provider credentials, schema execution, import execution, rollback, and parity procedures are accepted.
- Keep `API_PERSISTENCE_DRIVER=sqlite` for current releases.
- Add adapter-specific operational docs before allowing PostgreSQL mode to pass runtime validation.
