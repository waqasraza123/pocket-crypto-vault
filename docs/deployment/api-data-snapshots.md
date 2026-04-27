# Goal Vault API Data Snapshots

## Purpose
The current backend stores indexed vault state and analytics in SQLite files under `API_DATA_DIR`.

This runbook covers repository-owned snapshot and restore scripts for that data. It is a bridge until external managed database infrastructure is chosen.

## Files
- `scripts/create-api-data-snapshot.mjs`
  - snapshots current SQLite databases using SQLite `VACUUM INTO`
  - copies legacy local data files when present
  - writes a manifest with file sizes and SHA-256 checksums
- `scripts/restore-api-data-snapshot.mjs`
  - validates a snapshot manifest
  - checks SHA-256 checksums before restore
  - backs up existing files into a timestamped `.restore-backup-*` directory
  - restores only expected Goal Vault API data files

## Data Files
Current files:

- `goal-vault-indexer.sqlite`
- `goal-vault-analytics.sqlite`

Legacy local files can also be preserved:

- `goal-vault-indexer.json`
- `goal-vault-analytics.ndjson`

## Create Snapshot
Set `API_DATA_DIR` to the mounted API data directory:

```bash
API_DATA_DIR=/path/to/api-data pnpm api:data:snapshot
```

Optional variables:

- `API_DATA_SNAPSHOT_DIR`
  - output root; defaults to `artifacts/api-data-snapshots`
- `API_DATA_SNAPSHOT_LABEL`
  - stable snapshot label; defaults to the current timestamp

Output:

- snapshot directory
- copied database/data files
- `manifest.json`

## Restore Snapshot
Stop the API before restoring. Restoring while the API is writing can corrupt operator expectations.

```bash
API_DATA_DIR=/path/to/api-data \
API_DATA_RESTORE_SOURCE=/path/to/snapshot \
API_DATA_RESTORE_CONFIRM=restore \
pnpm api:data:restore
```

The restore script:

- requires explicit confirmation
- validates `manifest.json`
- verifies checksums
- backs up current files
- backs up and removes stale SQLite WAL/SHM sidecars before restoring SQLite files
- restores snapshot files

## Storage Guidance
- Treat snapshots as sensitive operational artifacts.
- Snapshots can include private vault metadata, wallet addresses, activity history, and analytics context.
- Do not commit snapshots.
- Store production snapshots only in the approved operational storage location.
- Keep snapshot retention short until a managed database backup policy exists.

## When To Snapshot
- before restoring a previous API image
- before changing factory addresses in API config
- before manual backend traffic movement
- before data-dir migration between hosts
- after a successful staging smoke run that should be preserved

## Managed Database Boundary
These scripts do not replace managed database infrastructure. They make the current SQLite-backed backend safer to operate while provider, database, migration, and retention decisions remain open.

Use `docs/deployment/api-managed-database-plan.md` to create a managed database plan before provisioning or migrating an external PostgreSQL target. Use `docs/deployment/api-managed-database-schema.md` to create the SQL review artifact after the plan. Managed database plans should reference snapshots by artifact name or approved storage reference, not by embedding snapshot contents or credentials.
