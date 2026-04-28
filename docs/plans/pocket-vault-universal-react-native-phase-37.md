# Pocket Vault Universal React Native Phase 37

## Objective
Add a driver-neutral pooled PostgreSQL executor boundary so future managed database runtime activation has explicit connection lifecycle and transaction semantics before any driver dependency is introduced.

## Implemented Scope
- Added `apps/api/src/modules/persistence/postgresql-runtime.ts`.
- Defined pool, checked-out client, and query target interfaces around the existing `PostgresqlQueryExecutor` contract.
- Added `PostgresqlPooledQueryExecutor` for plain pool queries, explicit client checkout transactions, rollback on failure, client release, and pool shutdown.
- Added `PostgresqlTransactionRollbackError` so rollback failures preserve both the original transaction failure and rollback failure.
- Kept PostgreSQL mode blocked by runtime validation, API startup, readiness, and preflight.
- Updated runtime, managed database, README, and repo-state documentation.

## Runtime Behavior
Current release behavior is unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- `API_PERSISTENCE_DRIVER=postgresql` remains blocked by runtime validation and preflight.
- no PostgreSQL driver, driver adapter, connection string loading, factory wiring, schema execution, import execution, parity execution, deployment, or traffic movement was added.

## Executor Contract
Future PostgreSQL driver wiring should adapt the selected driver to:

- `PostgresqlPool.query(sql, values)` for non-transactional operations
- `PostgresqlPool.connect()` for checked-out transaction clients
- `PostgresqlPoolClient.query(sql, values)` for all statements inside one transaction
- `PostgresqlPoolClient.release()` for all transaction completion and failure paths
- `PostgresqlPool.end()` for graceful API shutdown

`PostgresqlPooledQueryExecutor.transaction` starts a transaction with `BEGIN`, runs the operation through a checked-out client executor, commits on success, rolls back on operation or commit failure, and always releases the client.

## Current Boundary
This phase adds a reusable runtime boundary only. It does not import a Node PostgreSQL package, create a pool, read `API_DATABASE_URL`, change `createApiPersistenceStores`, relax runtime guardrails, mutate data, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Add the provider-approved PostgreSQL driver adapter.
- Wire `PostgresqlPooledQueryExecutor` into `createApiPersistenceStores` only after runtime activation evidence is accepted.
- Register PostgreSQL executor shutdown with the API lifecycle.
- Run PostgreSQL preflight, parity, runtime activation planning, release manifest, and traffic planning before enabling PostgreSQL mode.
