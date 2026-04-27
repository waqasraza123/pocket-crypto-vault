# Goal Vault API Persistence Runtime

## Purpose
The API persistence runtime guard makes storage mode explicit before managed database runtime work begins.

The API still runs on SQLite-backed persistence today. PostgreSQL is now a recognized configuration value, and inactive PostgreSQL store plus pooled executor boundaries exist behind the same persistence ports, but PostgreSQL mode is intentionally blocked at env validation, API startup, `/ready`, and API preflight until a real driver adapter, credential model, schema/import execution path, parity process, and rollback path are accepted.

This prevents an operator from setting `API_DATABASE_URL` and assuming the current API is using the managed database.

## Runtime Variables
- `API_PERSISTENCE_DRIVER`
  - `sqlite` or `postgresql`
  - defaults to `sqlite`
  - `postgresql` is recognized but blocked until the runtime connection layer is accepted
- `API_DATA_DIR`
  - SQLite data directory used while `API_PERSISTENCE_DRIVER=sqlite`
- `API_DATABASE_URL`
  - future PostgreSQL connection string
  - secret
  - reported only as configured or missing
- `API_PERSISTENCE_SCHEMA_NAME`
  - future PostgreSQL schema name
  - defaults to `goal_vault_api`

## Current SQLite Mode
Use SQLite mode for all current API releases:

```bash
API_PERSISTENCE_DRIVER=sqlite
API_DATA_DIR=/mounted/api-data
```

In SQLite mode:

- `/health` reports `persistenceDriver: "sqlite"`
- `/ready` marks the persistence driver ready
- API preflight records the SQLite data directory
- API store construction flows through `createApiPersistenceStores`
- API route and service modules consume `ApiIndexerStore` and `ApiAnalyticsStore` ports
- API read paths await persistence port methods so future external database adapters can perform network I/O
- API shutdown flows through the persistence factory close hook so store resources can be released centrally
- an inactive PostgreSQL store core exists but is not constructed by the runtime factory
- the inactive PostgreSQL store core accepts a transaction-aware query executor for future pooled runtime wiring
- an inactive pooled PostgreSQL executor boundary defines future pool query, client checkout, transaction, release, and shutdown semantics
- runtime activation must be planned with `pnpm api:database:runtime:plan` before PostgreSQL mode is enabled
- the API keeps using `goal-vault-indexer.sqlite` and `goal-vault-analytics.sqlite`
- managed database plan, schema, export, import plan, and parity artifacts remain handoff artifacts only

## Store Boundary
`apps/api/src/modules/persistence/ports.ts` defines the API persistence contract.

The current port types are:

- `ApiIndexerStore`
  - vault records
  - vault event records
  - factory and vault sync-state records
  - asynchronous read and write methods
- `ApiAnalyticsStore`
  - analytics event batch writes

`apps/api/src/modules/persistence/stores.ts` owns current persistence store construction.

The factory returns:

- indexer persistence for vaults, activity, and sync state
- analytics persistence for product event batches
- the selected persistence driver
- a `close` lifecycle method for releasing store resources

Route modules should consume stores from the API context instead of constructing persistence adapters directly. They should also import persisted record types from the persistence port module rather than from SQLite implementation files, and they should await persistence reads even when the current SQLite implementation resolves immediately. This keeps the future PostgreSQL adapter isolated to the persistence boundary.

`apps/api/src/modules/persistence/postgresql-store.ts` provides the inactive PostgreSQL store core. It depends only on an injected query executor and does not read secrets, open connections, run migrations, apply import SQL, or change runtime driver selection.

`apps/api/src/modules/persistence/postgresql-runtime.ts` provides the inactive pooled executor boundary. It depends on an injected pool-shaped object, delegates plain queries to the pool, checks out one client for `transaction`, commits on success, rolls back on operation or commit failure, releases the client in all transaction paths, and exposes `close` for future shutdown wiring.

Future driver wiring should adapt the selected PostgreSQL package to the pool interface instead of importing driver-specific types into store modules. Store modules should continue to depend only on `PostgresqlQueryExecutor`.

## Shutdown Lifecycle
`createIndexerContext` exposes the persistence factory close hook through the API context. `buildApp` registers a Fastify `onClose` hook that calls `context.close()`, and the API entrypoint closes the app on `SIGINT` and `SIGTERM`. The recurring indexer sync timer is cleared through the same close path.

Standalone jobs that create an indexer context must close it in a `finally` block. This is required before PostgreSQL runtime activation so both the long-running API process and one-shot operational scripts release future managed database pool resources consistently.

## Blocked PostgreSQL Mode
PostgreSQL mode is reserved for the future runtime adapter:

```bash
API_PERSISTENCE_DRIVER=postgresql
API_PERSISTENCE_SCHEMA_NAME=goal_vault_api
```

When selected today:

- `readApiRuntimeEnv` records the driver and redacted URL presence
- API startup fails with a validation error
- API preflight exits nonzero
- `/ready` marks persistence as blocked if an app is constructed with that env
- no database connection is attempted
- no migrations or imports are run

## Secret Boundary
Never put `API_DATABASE_URL` in docs, release manifests, traffic plans, import plans, or GitHub workflow inputs.

Store it only in the selected hosting provider secret store or GitHub Environment secrets when a future runtime adapter is ready. Reports should only include `postgresUrlConfigured: true` or `false`.

## Managed Database Handoff Sequence
The current provider-neutral path remains:

1. Create an API data snapshot.
2. Generate the managed database plan.
3. Generate the PostgreSQL schema bundle.
4. Generate the JSONL export bundle.
5. Generate the import plan and SQL artifact.
6. Execute schema and import steps through approved provider-owned access.
7. Generate and execute parity checks through approved operational access.
8. Add the provider-approved PostgreSQL driver adapter around the pooled executor boundary.
9. Wire the PostgreSQL store core through `createApiPersistenceStores`.
10. Keep graceful shutdown wired through the API context and standalone jobs.
11. Generate the managed database runtime activation plan.
12. Switch `API_PERSISTENCE_DRIVER` to `postgresql` only after the adapter, rollback path, runtime activation plan, and preflight checks are accepted.

## Boundary
Current runtime guardrails remain active. The inactive PostgreSQL store and pooled executor boundaries do not add a PostgreSQL driver, connect to a managed database, change API persistence behavior, execute import SQL, run parity checks, deploy the API, or move traffic.
