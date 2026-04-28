# Pocket Vault Universal React Native Phase 33

## Objective
Make the API persistence port contract asynchronous so an external managed database adapter can be added without rewriting route and service logic later.

## Implemented Scope
- Changed `ApiIndexerReadStore` read methods to return promises.
- Updated the SQLite `IndexerStore` implementation to satisfy the asynchronous port shape while preserving current SQLite behavior.
- Threaded `await` through vault list, vault detail, activity feed, metadata verification, metadata reconciliation, factory sync, vault sync, and readiness paths.
- Kept write methods asynchronous and unchanged at the API boundary.
- Updated affected static test fixtures to consume the asynchronous store reads.

## Runtime Behavior
Current release behavior remains unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- SQLite reads still execute locally through `node:sqlite`.
- routes and services now treat persistence reads as asynchronous boundary calls.
- PostgreSQL mode remains blocked by runtime validation and preflight.

## Adapter Contract
Future external database adapters can now implement the same `ApiIndexerStore` port with network-backed reads and writes:

- `listVaults`
- `getVault`
- `listEvents`
- `getSyncState`
- `listSyncStates`
- `upsertVault`
- `upsertEvent`
- `upsertSyncState`

Routes and services should continue to depend only on `ApiIndexerStore` and `ApiAnalyticsStore`.

## Current Boundary
This phase does not implement PostgreSQL persistence, add a database driver, change SQLite schemas, run migrations, execute imports, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Add a driver-backed PostgreSQL connection layer only after dependency, credential, rollback, and parity procedures are accepted.
- Keep `API_PERSISTENCE_DRIVER=sqlite` for current releases.
- Keep provider-specific deployment and traffic promotion outside the runtime adapter boundary.
