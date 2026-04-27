# Goal Vault Universal React Native Phase 38

## Objective
Add an API persistence lifecycle shutdown boundary so current SQLite stores and future PostgreSQL pools can be released consistently by the server and one-shot jobs.

## Implemented Scope
- Added `close` methods to the SQLite indexer and analytics stores.
- Added a `close` lifecycle method to `createApiPersistenceStores`.
- Exposed persistence shutdown through `IndexerContext`.
- Registered a Fastify `onClose` hook that calls the context close method.
- Added `SIGINT` and `SIGTERM` shutdown handling in the API entrypoint.
- Cleared the recurring indexer sync timer through the app close path.
- Updated standalone indexer and metadata reconciliation jobs to close their context in `finally` blocks.
- Updated runtime, managed database, README, and repo-state documentation.

## Runtime Behavior
Current release behavior is unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- `API_PERSISTENCE_DRIVER=postgresql` remains blocked by runtime validation and preflight.
- SQLite stores now close open database handles when the Fastify app or one-shot job context closes.
- no PostgreSQL driver, driver adapter, connection string loading, factory wiring, schema execution, import execution, parity execution, deployment, or traffic movement was added.

## Lifecycle Contract
Future persistence adapters should satisfy the same lifecycle shape:

- `createApiPersistenceStores` constructs store resources and returns `close`.
- `createIndexerContext` exposes the close method to API and job callers.
- `buildApp` closes persistence resources through Fastify `onClose`.
- one-shot jobs close contexts in `finally` blocks.
- process signal handlers close the Fastify app so persistence cleanup runs before process exit.

## Current Boundary
This phase changes shutdown wiring only. It does not enable PostgreSQL mode, import a database driver, create a managed database pool, execute migrations, run imports, run parity checks, deploy the API, or move traffic.

## Follow-Up
- Add the provider-approved PostgreSQL driver adapter around the pooled executor.
- Wire PostgreSQL stores through the persistence factory only after runtime activation evidence is accepted.
- Confirm provider container shutdown timing leaves enough grace for Fastify close and database pool shutdown.
