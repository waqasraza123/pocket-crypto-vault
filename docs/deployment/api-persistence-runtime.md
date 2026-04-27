# Goal Vault API Persistence Runtime

## Purpose
The API persistence runtime guard makes storage mode explicit before managed database runtime work begins.

The API still runs on SQLite-backed persistence today. PostgreSQL is now a recognized configuration value, but it is intentionally blocked at env validation, API startup, `/ready`, and API preflight until a real managed database adapter is implemented.

This prevents an operator from setting `API_DATABASE_URL` and assuming the current API is using the managed database.

## Runtime Variables
- `API_PERSISTENCE_DRIVER`
  - `sqlite` or `postgresql`
  - defaults to `sqlite`
  - `postgresql` is recognized but blocked until the runtime adapter exists
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
- the API keeps using `goal-vault-indexer.sqlite` and `goal-vault-analytics.sqlite`
- managed database plan, schema, export, import plan, and parity artifacts remain handoff artifacts only

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
8. Add the real PostgreSQL runtime adapter.
9. Switch `API_PERSISTENCE_DRIVER` to `postgresql` only after the adapter, rollback path, and preflight checks are accepted.

## Boundary
This phase adds explicit runtime guardrails. It does not add a PostgreSQL driver, connect to a managed database, change API persistence behavior, execute import SQL, run parity checks, deploy the API, or move traffic.
