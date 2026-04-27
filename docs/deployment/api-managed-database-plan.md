# Goal Vault API Managed Database Plan

## Purpose
The API managed database plan records how the current SQLite-backed API persistence layer should move toward an external managed PostgreSQL target.

It is not a migration workflow. It does not connect to a database, create schemas, copy rows, restore snapshots, deploy the API, or move traffic. It validates non-secret migration planning inputs, records the current schema inventory, and writes a JSON artifact that operators can review before any provider-specific database work.

## Files
- `scripts/write-api-managed-database-plan.mjs`
  - validates target, engine, cutover strategy, snapshot references, and managed database target reference
  - rejects target references that look like connection strings or credentials
  - records current SQLite stores, tables, columns, indexes, and data classification
  - writes a JSON managed database plan
  - emits the plan path for GitHub artifact upload
- `.github/workflows/api-managed-database-plan.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - uploads the managed database plan artifact
- `package.json`
  - exposes `pnpm api:database:plan`
- `docs/deployment/api-managed-database-schema.md`
  - turns this plan into reviewable PostgreSQL SQL and schema manifest artifacts
- `docs/deployment/api-managed-database-export.md`
  - converts a reviewed API data snapshot into table-level JSONL files for provider-owned import
- `docs/deployment/api-managed-database-import-plan.md`
  - writes psql-compatible import SQL and execution boundaries from a reviewed export bundle
- `docs/deployment/api-managed-database-parity.md`
  - records the table-level comparison checks operators should run after restore

## Required Inputs
- `API_DATABASE_PLAN_TARGET`
  - `staging` or `production`
- `API_DATABASE_PLAN_LABEL`
  - stable label for artifact naming
- `API_DATABASE_ENGINE`
  - currently `postgresql`
- `API_DATABASE_TARGET_REFERENCE`
  - non-secret managed database reference, such as an internal resource name
- `API_DATABASE_SOURCE_SNAPSHOT`
  - current API data snapshot artifact name or approved storage reference
- `API_DATABASE_ROLLBACK_SNAPSHOT`
  - previous known-good snapshot artifact name or approved storage reference
- `API_DATABASE_CUTOVER_STRATEGY`
  - `cold-cutover` or `shadow-restore`

Optional inputs:

- `API_DATABASE_PREFLIGHT_REPORT`
- `API_DATABASE_TRAFFIC_PLAN`
- `API_DATABASE_CHANGE_WINDOW`
- `API_DATABASE_OBSERVE_MINUTES`
- `API_DATABASE_OPERATOR`
- `API_DATABASE_NOTES`
- `API_DATABASE_PLAN_DIR`

## Secret Boundary
Do not put database connection strings, passwords, API tokens, RPC URLs, or private keys into the plan inputs.

`API_DATABASE_TARGET_REFERENCE` is intentionally a non-secret label. The script rejects values that look like URLs, userinfo-bearing references, or credential names. Managed database credentials must stay in hosting-provider secrets or GitHub Environment secrets and should only be used by future migration tooling.

## Current Schema Inventory
The generated plan records the current SQLite-backed persistence contract:

- `goal-vault-indexer.sqlite`
  - `vaults`
  - `vault_events`
  - `sync_states`
- `goal-vault-analytics.sqlite`
  - `analytics_events`

The plan includes table columns, primary keys, indexes, and whether the table can contain private vault metadata.

## Cutover Strategies
### Cold Cutover
Use `cold-cutover` when API writes will be paused during migration.

The generated steps require:

1. Stop public API traffic or enter a maintenance window.
2. Create a fresh API data snapshot.
3. Restore the snapshot into the managed database target through an operator-owned procedure.
4. Run API preflight against the managed database runtime environment.
5. Deploy the API image pointed at the managed database target.
6. Generate an API traffic plan before public traffic resumes.

### Shadow Restore
Use `shadow-restore` when operators want to restore into a non-public managed database target before cutover.

The generated steps require:

1. Create a fresh API data snapshot.
2. Restore the snapshot into a non-public managed database target.
3. Run read-only parity checks.
4. Run API preflight against the managed database runtime environment.
5. Deploy a candidate API host pointed at the managed database target.
6. Generate an API traffic plan before public traffic movement.

## Parity Expectations
Before traffic movement, operators should compare:

- row counts for `vaults`
- row counts for `vault_events`
- row counts for `sync_states`
- row counts for `analytics_events`
- latest indexed block and latest indexed log index by chain and stream
- latest analytics event timestamp by environment
- sample vault metadata rows where private display fields are expected

The repository does not yet include a live parity checker because no managed database provider, credentials model, or driver dependency has been selected.

## Rollback Expectations
Rollback requires:

- previous known-good API image
- previous known-good persistence configuration
- planned rollback snapshot
- API stopped before restore
- `/health` and `/ready` checks after restore
- release notes that record the managed database target reference and failure reason

## Promotion Sequence
Use the managed database plan before adding provider-specific database infrastructure:

1. Create an API data snapshot.
2. Generate the managed database plan.
3. Generate the managed database schema bundle.
4. Generate the managed database export bundle from the reviewed snapshot.
5. Generate the managed database import plan from the reviewed export bundle.
6. Review schema inventory, SQL, import SQL, export row counts, checksums, and data classification.
7. Provision the managed database outside this repository.
8. Apply DDL through the selected provider or future migration tool.
9. Import the JSONL export through an operator-owned procedure.
10. Generate the managed database parity plan.
11. Run parity checks through approved operational access.
12. Run API preflight with the managed database runtime configuration.
13. Generate the release manifest and API traffic plan.
14. Move traffic manually only after the selected hosting-provider operator approves the plan.

## Boundary
This phase creates a reviewable migration plan and schema inventory. Database provisioning, schema application, data copy, parity automation, runtime adapter changes, traffic movement, and rollback automation remain deferred until the managed database provider and credential model are selected.
