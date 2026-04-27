# Goal Vault API Managed Database Export

## Purpose
The API managed database export converts an API data snapshot into table-level JSONL files that an operator can import into a managed PostgreSQL target.

It does not connect to PostgreSQL, apply schema, import rows, run parity checks, deploy the API, or move traffic. It reads a local snapshot directory, verifies snapshot checksums, exports known SQLite tables, and writes a manifest with row counts and export checksums.

## Files
- `scripts/write-api-managed-database-export.mjs`
  - reads a snapshot `manifest.json`
  - verifies snapshot file checksums
  - exports supported SQLite tables to JSONL
  - writes an export manifest with row counts, bytes, and SHA-256 checksums
  - emits export and manifest paths for GitHub artifact upload
- `.github/workflows/api-managed-database-export.yml`
  - manual staging or production workflow
  - can download a prior snapshot artifact by run ID or use a runner-local snapshot path
  - uploads the export bundle artifact
- `package.json`
  - exposes `pnpm api:database:export`
- `docs/deployment/api-managed-database-import-plan.md`
  - turns reviewed export bundles into psql-compatible import SQL and an execution plan

## Required Inputs
- `API_DATABASE_EXPORT_TARGET`
  - `staging` or `production`
- `API_DATABASE_EXPORT_LABEL`
  - stable label used in export artifact naming
- `API_DATABASE_EXPORT_FORMAT`
  - currently `jsonl`
- `API_DATABASE_EXPORT_SNAPSHOT_SOURCE`
  - local snapshot directory containing `manifest.json`

Optional inputs:

- `API_DATABASE_EXPORT_DATABASE_PLAN`
- `API_DATABASE_EXPORT_SCHEMA_MANIFEST`
- `API_DATABASE_EXPORT_PARITY_PLAN`
- `API_DATABASE_EXPORT_DIR`

## Exported Tables
The exporter writes JSONL files for tables present in the snapshot:

- `vaults.jsonl`
- `vault_events.jsonl`
- `sync_states.jsonl`
- `analytics_events.jsonl`

The current exporter reads:

- `goal-vault-indexer.sqlite`
- `goal-vault-analytics.sqlite`

Legacy JSON or NDJSON snapshot files are preserved by snapshot tooling, but they are not converted by this managed database exporter.

## Local Usage
Create or download a snapshot first, then run:

```bash
API_DATABASE_EXPORT_TARGET=staging \
API_DATABASE_EXPORT_LABEL=v0.1.0-db-export \
API_DATABASE_EXPORT_FORMAT=jsonl \
API_DATABASE_EXPORT_SNAPSHOT_SOURCE=artifacts/api-data-snapshots/staging-before-cutover \
API_DATABASE_EXPORT_DATABASE_PLAN=goal-vault-api-database-staging-v0.1.0-db-cutover \
API_DATABASE_EXPORT_SCHEMA_MANIFEST=goal-vault-api-database-schema-staging-v0.1.0-db-schema \
pnpm api:database:export
```

Output:

- export directory
- JSONL files
- `manifest.json`

## GitHub Workflow Usage
Run `API Managed Database Export` manually.

Use either:

- `snapshot_artifact` plus `snapshot_run_id`
- `snapshot_source`

The workflow requires `snapshot_run_id` when `snapshot_artifact` is provided so the export reads a specific previous run instead of relying on ambiguous artifact lookup. The artifact path is useful when exporting from a snapshot created by a previous GitHub Actions run. The runner-local path is useful for controlled self-hosted or operator-managed runners.

## Manifest Contents
The export manifest records:

- target
- export label
- format
- source snapshot label and generation timestamp
- optional managed database plan, schema manifest, and parity plan references
- exported table names
- source SQLite file for each table
- row counts
- bytes
- SHA-256 checksums
- data classification
- git metadata
- `noDatabaseConnected: true`
- `noDataImported: true`

## Data Handling
Export bundles are sensitive operational artifacts.

They can contain:

- wallet addresses
- private vault metadata
- activity history
- analytics context

Do not commit export bundles. Store them only in approved operational storage and keep retention short until a managed database backup and retention policy exists.

## Import Boundary
This repository does not yet import JSONL into PostgreSQL. Import belongs to future provider-specific or driver-backed tooling after the managed database provider and credential model are selected.

Operators should only import after:

1. Schema bundle review.
2. Managed database target provisioning.
3. Credential handling outside this repository.
4. Export manifest checksum review.
5. Approved migration window.

## Follow-Up
The normal sequence is:

1. Create an API data snapshot.
2. Generate or review the managed database plan.
3. Generate or review the managed database schema bundle.
4. Generate this export bundle from the reviewed snapshot.
5. Generate or review the managed database import plan.
6. Import the JSONL files through provider-owned tooling.
7. Generate or review the managed database parity plan.

After importing:

1. Generate or review the managed database parity plan.
2. Run parity queries through approved operational access.
3. Run API preflight with managed database runtime configuration.
4. Generate release manifest and API traffic plan.
5. Move traffic only after parity and readiness are accepted.
