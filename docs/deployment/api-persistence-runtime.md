# Pocket Vault API Persistence Runtime

## Purpose
The API persistence runtime guard makes storage mode explicit before managed database runtime work begins.

The API defaults to SQLite-backed persistence. PostgreSQL is now a runtime-capable configuration value behind the same persistence ports, but it is only allowed when the managed database URL is configured and the expected PostgreSQL schema already exists.

This prevents an operator from setting `API_DATABASE_URL` and assuming the API has applied schema, imported data, compared parity, or moved traffic. Runtime activation still requires the managed database evidence path and operator review.

Production activation requires `API_PERSISTENCE_DRIVER=postgresql`. SQLite remains available for local development and staging rehearsal, but production `/ready` and preflight treat SQLite as blocked for limited beta traffic.

## Runtime Variables
- `API_PERSISTENCE_DRIVER`
  - `sqlite` or `postgresql`
  - defaults to `sqlite`
  - `postgresql` requires `API_DATABASE_URL` and existing schema tables
- `API_POSTGRES_DRIVER`
  - `pg` or `neon`
  - defaults to `pg`
  - selects the PostgreSQL client used when `API_PERSISTENCE_DRIVER=postgresql`
  - use `neon` with a Neon pooled connection string for production Neon persistence
- `API_DATA_DIR`
  - SQLite data directory used while `API_PERSISTENCE_DRIVER=sqlite`
- `API_DATABASE_URL`
  - PostgreSQL connection string
  - secret
  - reported only as configured or missing
- `API_PERSISTENCE_SCHEMA_NAME`
  - PostgreSQL schema name
  - defaults to `goal_vault_api`
- `API_ROLLBACK_EVIDENCE_ACCEPTED`
  - set to `true` only after rollback URL, image, snapshot, and traffic reversal evidence are accepted
- `API_SMOKE_EVIDENCE_ACCEPTED`
  - set to `true` only after protected production smoke evidence is accepted
- `API_LIMITED_BETA_SCOPE_APPROVED`
  - set to `true` only after beta participant limit, value limit, support owner, incident owner, monitoring window, and pause criteria are approved

## Current SQLite Mode
Use SQLite mode for all current API releases:

```bash
API_PERSISTENCE_DRIVER=sqlite
API_DATA_DIR=/mounted/api-data
```

In SQLite mode:

- `/health` reports `persistenceDriver: "sqlite"`
- `/ready` marks the persistence driver ready for local or staging use, but production activation remains blocked
- API preflight records the SQLite data directory
- API store construction flows through `createApiPersistenceStores`
- API route and service modules consume `ApiIndexerStore` and `ApiAnalyticsStore` ports
- API read paths await persistence port methods so future external database adapters can perform network I/O
- API shutdown flows through the persistence factory close hook so store resources can be released centrally
- `/ready` and API preflight report redacted persistence capability gates for PostgreSQL runtime activation
- a PostgreSQL store core exists and is constructed only when `API_PERSISTENCE_DRIVER=postgresql`
- the PostgreSQL store core accepts a transaction-aware query executor
- the pooled PostgreSQL executor delegates queries to `pg` by default or Neon when `API_POSTGRES_DRIVER=neon`, checks out one client for `transaction`, commits on success, rolls back failures, releases clients, and exposes shutdown
- runtime activation should still be planned with `pnpm api:database:runtime:plan` before production traffic uses PostgreSQL mode
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
- support persistence for beta support requests
- the selected persistence driver
- a `close` lifecycle method for releasing store resources

Route modules should consume stores from the API context instead of constructing persistence adapters directly. They should also import persisted record types from the persistence port module rather than from SQLite implementation files, and they should await persistence reads even when the current SQLite implementation resolves immediately. This keeps PostgreSQL adapter details isolated to the persistence boundary.

`apps/api/src/modules/persistence/postgresql-driver.ts` adapts `pg` or Neon into the existing pooled executor boundary, checks connectivity with `SELECT 1`, and checks that the selected schema contains `vaults`, `vault_events`, `sync_states`, `analytics_events`, and `support_requests`.

`apps/api/src/modules/persistence/postgresql-store.ts` provides the PostgreSQL store core. It depends only on an injected query executor and does not read secrets, run migrations, apply import SQL, or change runtime driver selection.

`apps/api/src/modules/persistence/postgresql-runtime.ts` provides the pooled executor boundary. It depends on an injected pool-shaped object, delegates plain queries to the pool, checks out one client for `transaction`, commits on success, rolls back on operation or commit failure, releases the client in all transaction paths, and exposes `close` for shutdown wiring.

Store modules should continue to depend only on `PostgresqlQueryExecutor`.

## Capability Reporting
The API runtime env includes a redacted persistence capability model used by `/ready` and API preflight.

Ready today:

- SQLite runtime store construction
- asynchronous persistence ports
- PostgreSQL driver adapter through `pg`
- Neon PostgreSQL driver adapter through `@neondatabase/serverless` and `ws`
- PostgreSQL store factory wiring
- PostgreSQL preflight connection and schema checks
- PostgreSQL store core
- PostgreSQL transaction boundary
- pooled PostgreSQL executor boundary
- shared persistence shutdown lifecycle

Capability reports must never include `API_DATABASE_URL`; they can only report whether credentials are configured and which non-secret activation gates remain incomplete.

## Shutdown Lifecycle
`createIndexerContext` exposes the persistence factory close hook through the API context. `buildApp` registers a Fastify `onClose` hook that calls `context.close()`, and the API entrypoint closes the app on `SIGINT` and `SIGTERM`. The recurring indexer sync timer is cleared through the same close path.

Standalone jobs that create an indexer context must close it in a `finally` block. This is required before PostgreSQL runtime activation so both the long-running API process and one-shot operational scripts release future managed database pool resources consistently.

## PostgreSQL Mode
Use PostgreSQL mode only after schema/import/parity evidence and rollback plans are accepted:

```bash
API_PERSISTENCE_DRIVER=postgresql
API_POSTGRES_DRIVER=neon
API_DATABASE_URL=<managed database secret>
API_PERSISTENCE_SCHEMA_NAME=goal_vault_api
```

When selected:

- `readApiRuntimeEnv` records the driver and redacted URL presence
- API startup opens a PostgreSQL pool through `pg` by default or Neon when `API_POSTGRES_DRIVER=neon`
- API startup checks connectivity and required table presence
- API preflight runs the same redacted connection and schema checks
- `/ready` marks persistence ready when runtime gates pass
- no migrations, imports, parity checks, or schema creation are run by the API
- `/ready.productionActivation` can become safe for limited beta only after PostgreSQL runtime, protected smoke evidence, rollback evidence, and limited beta scope are accepted

## Secret Boundary
Never put `API_DATABASE_URL` in docs, release manifests, traffic plans, import plans, or GitHub workflow inputs.

Store it only in the selected hosting provider secret store or GitHub Environment secrets. Reports should only include `postgresUrlConfigured: true` or `false`.

## Managed Database Handoff Sequence
The current provider-neutral path remains:

1. Create an API data snapshot.
2. Generate the managed database plan.
3. Generate the PostgreSQL schema bundle.
4. Generate the JSONL export bundle.
5. Generate the import plan and SQL artifact.
6. Execute schema and import steps through approved provider-owned access.
7. Generate and execute parity checks through approved operational access.
8. Run API preflight with PostgreSQL mode and confirm connection plus schema checks pass.
9. Generate the managed database runtime activation plan.
10. Switch `API_PERSISTENCE_DRIVER` to `postgresql` and `API_POSTGRES_DRIVER` to the selected client only after rollback path, runtime activation plan, and preflight checks are accepted.

## Boundary
Current runtime guardrails remain active. The PostgreSQL adapter can connect to an operator-configured managed database, but it does not execute import SQL, run parity checks, deploy the API, provision infrastructure, or move traffic.
