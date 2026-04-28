# Pocket Vault API Managed Database Schema

## Purpose
The API managed database schema bundle writes the PostgreSQL DDL that mirrors the current SQLite-backed API persistence contract.

It is not a migration workflow. It does not connect to PostgreSQL, create schemas, apply DDL, copy rows, deploy the API, or move traffic. It creates a reviewable SQL artifact and JSON manifest that operators can inspect before provider-specific database work.

## Files
- `scripts/write-api-managed-database-schema.mjs`
  - validates target, engine, schema label, and schema name
  - writes PostgreSQL DDL for the current API persistence tables
  - writes a schema manifest with table sources, primary keys, indexes, and private-data classification
  - emits schema and manifest paths for GitHub artifact upload
- `.github/workflows/api-managed-database-schema.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - uploads SQL and JSON schema artifacts
- `package.json`
  - exposes `pnpm api:database:schema`

## Required Inputs
- `API_DATABASE_SCHEMA_TARGET`
  - `staging` or `production`
- `API_DATABASE_SCHEMA_LABEL`
  - stable label used in artifact naming
- `API_DATABASE_SCHEMA_ENGINE`
  - currently `postgresql`
- `API_DATABASE_SCHEMA_NAME`
  - lowercase PostgreSQL schema identifier; defaults to `goal_vault_api`

Optional inputs:

- `API_DATABASE_SCHEMA_SOURCE_PLAN`
  - managed database plan artifact name or URL
- `API_DATABASE_SCHEMA_DIR`
  - output directory for local artifacts

## Output Artifacts
The script writes:

- `pocket-vault-api-database-schema-<target>-<label>.sql`
- `pocket-vault-api-database-schema-<target>-<label>.json`

The SQL artifact contains:

- schema creation
- `vaults`
- `vault_events`
- `sync_states`
- `analytics_events`
- `support_requests`
- indexes matching the current query shape

The JSON manifest records:

- target
- engine
- schema name
- schema label
- current persistence source
- optional source plan reference
- source SQLite file for each table
- primary keys
- indexes
- private metadata classification
- git metadata
- `noDatabaseMutated: true`

## Schema Shape
The schema mirrors the current API stores:

- `vaults`
  - enriched vault summaries, metadata, reconciliation status, rule state, and balance snapshots
- `vault_events`
  - normalized confirmed onchain activity
- `sync_states`
  - per-chain indexer lifecycle and latest block state
- `analytics_events`
  - bounded product analytics context and payload JSON
- `support_requests`
  - beta support request subject, message, optional contact, wallet, route, and triage context

Amounts remain text values because the current API persists atomic token amounts as strings. Timestamp-like fields also remain text values to match the current API serialization contract and avoid a silent migration transform in the schema artifact.

## Operator Sequence
Use the schema bundle after the managed database plan:

1. Generate an API data snapshot.
2. Generate the managed database plan.
3. Generate the managed database schema bundle.
4. Review the SQL and manifest.
5. Apply the SQL manually through the selected provider or future migration tool.
6. Generate the managed database export bundle from the reviewed API data snapshot.
7. Generate the managed database import plan from the reviewed export bundle.
8. Import the JSONL files through an operator-owned migration procedure.
9. Generate the managed database parity plan.
10. Run parity checks before API traffic movement.

## Boundary
This phase creates a portable PostgreSQL schema artifact. Schema application is handled separately by `API Managed Database Schema Apply` after protected environment approval, `API_DATABASE_URL`, a reviewed schema artifact, and `confirm_apply=apply` are present.
