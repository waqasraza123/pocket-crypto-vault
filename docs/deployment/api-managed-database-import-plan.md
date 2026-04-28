# Pocket Vault API Managed Database Import Plan

## Purpose
The API managed database import plan turns a reviewed managed database export bundle into an operator-facing PostgreSQL import SQL artifact and JSON execution plan.

It does not connect to PostgreSQL, use credentials, apply schema, import rows, run parity checks, deploy the API, or move traffic. It reads a local export bundle, verifies JSONL file row counts and checksums against the export manifest, and writes a psql-compatible import script plus a plan manifest.

## Files
- `scripts/write-api-managed-database-import-plan.mjs`
  - reads a managed database export `manifest.json`
  - verifies every expected JSONL file checksum, byte count, and row count
  - writes a PostgreSQL import SQL file that loads JSONL through temporary `jsonb` staging tables
  - writes an import plan manifest with psql variables, artifact references, controls, and rollback triggers
  - emits plan and SQL paths for GitHub artifact upload
- `.github/workflows/api-managed-database-import-plan.yml`
  - manual staging or production workflow
  - can download a prior export artifact by run ID or use a runner-local export path
  - uploads the import plan and SQL artifacts
- `scripts/execute-api-managed-database-import.mjs`
  - reads a reviewed import plan plus verified JSONL export bundle
  - connects to PostgreSQL with `API_DATABASE_URL`
  - upserts all managed database tables inside one transaction
  - writes a redacted import execution result artifact
- `.github/workflows/api-managed-database-import-execute.yml`
  - approval-gated staging or production workflow
  - requires `confirm_execute=import`
  - downloads the import plan and export bundle artifacts before execution
- `package.json`
  - exposes `pnpm api:database:import:plan`
  - exposes `pnpm api:database:import:execute`

## Required Inputs
- `API_DATABASE_IMPORT_TARGET`
  - `staging` or `production`
- `API_DATABASE_IMPORT_LABEL`
  - stable label used in import artifact naming
- `API_DATABASE_IMPORT_ENGINE`
  - currently `postgresql`
- `API_DATABASE_IMPORT_MODE`
  - `initial-import`, `retry-import`, or `rollback-restore`
- `API_DATABASE_IMPORT_TARGET_REFERENCE`
  - non-secret managed database target reference
- `API_DATABASE_IMPORT_SCHEMA_NAME`
  - lowercase PostgreSQL schema name, usually `goal_vault_api`
- `API_DATABASE_IMPORT_EXPORT_SOURCE`
  - local export bundle directory or direct path to its `manifest.json`

Optional inputs:

- `API_DATABASE_IMPORT_DATABASE_PLAN`
- `API_DATABASE_IMPORT_SCHEMA_MANIFEST`
- `API_DATABASE_IMPORT_PARITY_PLAN`
- `API_DATABASE_IMPORT_CHANGE_WINDOW`
- `API_DATABASE_IMPORT_OBSERVE_MINUTES`
- `API_DATABASE_IMPORT_OPERATOR`
- `API_DATABASE_IMPORT_NOTES`
- `API_DATABASE_IMPORT_DIR`

## Secret Boundary
Do not put database connection strings, passwords, API tokens, RPC URLs, or private keys into import plan inputs.

`API_DATABASE_IMPORT_TARGET_REFERENCE` is intentionally a non-secret label. The generated SQL is only an artifact. Operators run it later through approved provider access with credentials outside this repository.

Import execution uses `API_DATABASE_URL` only from protected runtime secrets. Execution result artifacts record row counts and checksums, but never record connection strings.

## Generated Artifacts
The script writes:

- `pocket-vault-api-database-import-<target>-<label>.json`
- `pocket-vault-api-database-import-<target>-<label>.sql`

The JSON plan records:

- target
- engine
- import mode
- non-secret target reference
- schema name
- export bundle manifest reference
- verified JSONL file names, row counts, bytes, and SHA-256 checksums
- required psql variable names
- optional managed database plan, schema manifest, and parity plan references
- execution boundaries
- rollback triggers
- git metadata
- `noDatabaseConnected: true`
- `noDataImported: true`

The SQL artifact:

- expects PostgreSQL schema tables to already exist
- creates temporary raw `jsonb` staging tables
- loads each JSONL file through `\copy`
- casts JSON fields into the current PostgreSQL table shapes
- upserts by primary key so retry runs are deterministic
- reports current table row counts after each import

## Execution Shape
Operators can either run the generated SQL through approved provider access or use the guarded repository execution workflow.

The SQL expects these psql variables:

- `vaults_jsonl`
- `vault_events_jsonl`
- `sync_states_jsonl`
- `analytics_events_jsonl`
- `support_requests_jsonl`

Example execution shape:

```bash
psql "$APPROVED_DATABASE_URL" \
  -v vaults_jsonl=/approved/export/vaults.jsonl \
  -v vault_events_jsonl=/approved/export/vault_events.jsonl \
  -v sync_states_jsonl=/approved/export/sync_states.jsonl \
  -v analytics_events_jsonl=/approved/export/analytics_events.jsonl \
  -v support_requests_jsonl=/approved/export/support_requests.jsonl \
  -f pocket-vault-api-database-import-staging-v0.1.0-db-import.sql
```

Do not store the connection string in repository files, workflow inputs, release manifests, or import plans.

The guarded workflow path is:

1. Run `API Managed Database Import Plan`.
2. Review the generated plan, SQL, source export manifest, and schema evidence.
3. Run `API Managed Database Import Execute`.
4. Provide the import plan artifact, export artifact, run IDs, target reference, and `confirm_execute=import`.
5. Download the execution result artifact and keep it with release evidence.

## GitHub Workflow Usage
Run `API Managed Database Import Plan` manually.

Use either:

- `export_artifact` plus `export_run_id`
- `export_source`

The workflow requires `export_run_id` when `export_artifact` is provided so the import plan is pinned to a specific export artifact. The artifact path is useful when planning from a previous GitHub Actions export run. The runner-local path is useful for controlled self-hosted or operator-managed runners.

## Operator Sequence
Use this import plan after export bundle review:

1. Create an API data snapshot.
2. Generate the managed database plan.
3. Generate and review the managed database schema bundle.
4. Generate and review the managed database export bundle.
5. Generate this import plan and SQL artifact.
6. Provision the PostgreSQL target outside this repository.
7. Apply the schema SQL through approved operational access.
8. Run the import through approved operational access or `API Managed Database Import Execute`.
9. Generate or review the managed database parity plan.
10. Run parity queries before API traffic movement.

## Rollback Triggers
Rollback or abort the import when:

- export bundle checksums or row counts do not match the export manifest
- schema tables are missing or incompatible
- the generated SQL fails before `COMMIT`
- parity checks do not match without an approved reset or controlled sync advancement
- `/ready` reports blocked checks after managed database runtime configuration

## Boundary
The planning workflow remains non-mutating. The execution workflow mutates the selected PostgreSQL target only when protected environment approval, `API_DATABASE_URL`, reviewed artifacts, and `confirm_execute=import` are present.
