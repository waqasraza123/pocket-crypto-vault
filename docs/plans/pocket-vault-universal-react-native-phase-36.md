# Pocket Vault Universal React Native Phase 36

## Objective
Add transaction-aware PostgreSQL query executor support to the inactive persistence store core before any runtime driver wiring.

## Implemented Scope
- Extended `PostgresqlQueryExecutor` with an optional `transaction` method.
- Added an internal transaction helper for PostgreSQL store operations.
- Wrapped PostgreSQL analytics batch persistence in the transaction helper.
- Kept the PostgreSQL store core driver-neutral and inactive.
- Updated runtime and project documentation.

## Runtime Behavior
Current release behavior is unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- `API_PERSISTENCE_DRIVER=postgresql` remains blocked by runtime validation and preflight.
- no PostgreSQL driver, connection pool, credential loading, factory wiring, schema execution, import execution, parity execution, deployment, or traffic movement was added.

## Adapter Contract
Future PostgreSQL driver wiring should provide a query executor that supports:

- parameterized `query(sql, values)` calls
- `transaction(operation)` using one checked-out database client for the entire operation
- rollback on operation failure
- connection release after commit or rollback

The current fallback transaction path is suitable only for a single-client executor. A pooled runtime adapter should implement `transaction` explicitly.

## Current Boundary
This phase changes only the inactive PostgreSQL store core. It does not connect to PostgreSQL, add a database dependency, change API startup, relax runtime guardrails, mutate data, run tests, run builds, deploy the API, or move traffic.

## Follow-Up
- Add a provider-approved PostgreSQL driver and connection pool.
- Implement `transaction` against a checked-out pool client.
- Wire `PostgresqlIndexerStore` and `PostgresqlAnalyticsStore` through `createApiPersistenceStores` only after runtime activation evidence is accepted.
