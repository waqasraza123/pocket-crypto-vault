# Pocket Vault Universal React Native Phase 22

## Focus
Phase 22 adds API data snapshot and restore tooling for the current SQLite-backed backend persistence.

## Implemented
- Added API data snapshot script.
- Added API data restore script with checksum validation and current-file backup.
- Added root scripts for snapshot and restore commands.
- Added deployment runbook for API data snapshots, restore, sensitivity, and managed database boundaries.

## Boundaries
- No snapshot was created.
- No restore was run.
- No managed database infrastructure was added.
- No provider-specific storage integration was added.
- No backend traffic promotion workflow was added.

## Operator Setup
- Set `API_DATA_DIR` to the mounted API data directory before snapshot or restore.
- Stop the API before restoring.
- Store snapshots only in approved operational storage.
- Treat snapshots as sensitive because they can contain wallet, vault metadata, activity, and analytics context.

## Follow-Up
- Select managed database infrastructure.
- Define backup retention and encryption policy.
- Replace SQLite snapshot scripts with provider-native backups after the database migration is complete.
