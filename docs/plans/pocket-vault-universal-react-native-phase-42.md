# Pocket Vault Universal React Native Phase 42

## Objective
Enable real-audience beta backend persistence by wiring the PostgreSQL runtime adapter behind the existing API persistence ports while keeping rollout gated by secrets, schema evidence, preflight, and operator review.

## Implemented Scope
- Added `pg` as the API PostgreSQL driver dependency.
- Added `apps/api/src/modules/persistence/postgresql-driver.ts`.
- Wired `API_PERSISTENCE_DRIVER=postgresql` through `createApiPersistenceStores`.
- Reused the existing `PostgresqlIndexerStore`, `PostgresqlAnalyticsStore`, and pooled executor boundary.
- Added startup/runtime checks that require:
  - `API_DATABASE_URL`
  - a loadable `pg` pool adapter
  - a successful `SELECT 1`
  - existing PostgreSQL tables in `API_PERSISTENCE_SCHEMA_NAME`
- Updated API preflight to run redacted PostgreSQL connection and schema checks when PostgreSQL mode is selected.
- Updated readiness copy so `/health`, `/ready`, release readiness, and preflight distinguish active PostgreSQL from blocked PostgreSQL configuration.
- Updated deployment and environment documentation.

## Runtime Behavior
SQLite remains the default driver.

PostgreSQL mode is now runtime-capable only when an operator has already applied the accepted schema/import path:

```bash
API_PERSISTENCE_DRIVER=postgresql
API_DATABASE_URL=<secret managed database connection string>
API_PERSISTENCE_SCHEMA_NAME=goal_vault_api
```

The API does not create schemas, run migrations, execute import SQL, run parity comparisons, deploy infrastructure, or move traffic. Missing tables fail preflight and API startup with a clear non-secret error.

## Secret Boundary
`API_DATABASE_URL` is read only by runtime code and preflight connection checks. Reports and logs continue to expose only `postgresUrlConfigured`, connection/schema check status, schema name, and missing table names.

## Operator Sequence
1. Keep production on SQLite until the managed database schema, export, import, parity, release manifest, traffic plan, and rollback evidence are accepted.
2. Apply the PostgreSQL schema and import through approved provider-owned access.
3. Run API preflight with `API_PERSISTENCE_DRIVER=postgresql`.
4. Confirm `connectionCheck: "passed"`, `schemaCheck: "passed"`, and `missingTables: []`.
5. Generate the managed database runtime activation plan from the passing preflight report.
6. Deploy a candidate API image with PostgreSQL env only after rollback image, traffic plan, and source/rollback snapshots are documented.

## Boundary
This phase adds runtime adapter and factory wiring. It does not select a hosting provider, provision a database, apply schema, import data, compare parity, deploy an API image, promote traffic, or run real chain operations.
