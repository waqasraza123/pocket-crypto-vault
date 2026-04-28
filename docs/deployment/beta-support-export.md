# Pocket Vault Beta Support Export

## Purpose
The beta support export creates an offline operator review package from an existing API data snapshot.

It does not connect to a live database, call the API, mutate support status, send email, create tickets, or publish public reports. It reads a verified snapshot, exports support requests into JSONL, and writes a manifest that marks the artifact as private operational data that must not be committed.

## Files
- `scripts/write-beta-support-export.mjs`
  - validates target, mode, snapshot evidence, filters, limit, and operator notes
  - verifies the API data snapshot manifest and analytics database checksum
  - exports rows from `support_requests`
  - writes a summary JSON, JSONL export, and manifest
- `.github/workflows/beta-support-export.yml`
  - manual staging or production workflow
  - downloads an API data snapshot artifact or reads a runner-local snapshot directory
  - supports `summary` and `private` export modes
  - uploads the export artifact without connecting to live storage
- `package.json`
  - exposes `pnpm beta:support:export`

## Inputs
Required:

- `BETA_SUPPORT_EXPORT_TARGET`
- `BETA_SUPPORT_EXPORT_LABEL`
- `BETA_SUPPORT_EXPORT_MODE`
- `BETA_SUPPORT_EXPORT_SOURCE`

Optional:

- `BETA_SUPPORT_EXPORT_STATUS`
- `BETA_SUPPORT_EXPORT_CATEGORY`
- `BETA_SUPPORT_EXPORT_PRIORITY`
- `BETA_SUPPORT_EXPORT_LIMIT`
- `BETA_SUPPORT_EXPORT_OPERATOR`
- `BETA_SUPPORT_EXPORT_INCIDENT_REFERENCE`
- `BETA_SUPPORT_EXPORT_NOTES`
- `BETA_SUPPORT_EXPORT_DIR`

Private mode requires:

- `BETA_SUPPORT_EXPORT_CONFIRM_PRIVATE=export-private-support`

## Modes
### Summary
`summary` mode is the default. It writes:

- request ID
- status
- category
- priority
- truncated subject preview
- truncated message preview
- hashed wallet, contact email, and vault address references
- route, environment, deployment target, chain ID, wallet status, requester IP hash, and timestamp

Summary mode is still operational data. It may contain user-written previews and must not be committed or attached to public issues.

### Private
`private` mode writes full support request content:

- subject
- message
- reporter wallet
- contact email
- route and runtime context
- user agent
- requester IP hash

Private mode requires explicit confirmation because it contains user support content and contact details.

## Local Usage
Example summary export:

```bash
BETA_SUPPORT_EXPORT_TARGET=staging \
BETA_SUPPORT_EXPORT_LABEL=v0.1.0-beta-review \
BETA_SUPPORT_EXPORT_MODE=summary \
BETA_SUPPORT_EXPORT_SOURCE=./artifacts/api-data-snapshots/v0.1.0-beta-review \
pnpm beta:support:export
```

Example private export:

```bash
BETA_SUPPORT_EXPORT_TARGET=staging \
BETA_SUPPORT_EXPORT_LABEL=incident-20260427 \
BETA_SUPPORT_EXPORT_MODE=private \
BETA_SUPPORT_EXPORT_CONFIRM_PRIVATE=export-private-support \
BETA_SUPPORT_EXPORT_SOURCE=./artifacts/api-data-snapshots/incident-20260427 \
BETA_SUPPORT_EXPORT_STATUS=open \
BETA_SUPPORT_EXPORT_PRIORITY=urgent \
pnpm beta:support:export
```

## GitHub Workflow Usage
Run the `Beta Support Export` workflow manually after an API data snapshot exists.

Provide either:

- `snapshot_artifact` plus `snapshot_run_id`
- `snapshot_source` for a runner-local snapshot directory

Use `summary` mode for routine beta review. Use `private` mode only for approved support operations where the operator needs full user text or contact details.

## Artifact Contents
The export directory contains:

- `manifest.json`
  - source snapshot metadata
  - filters
  - mode
  - output checksums
  - aggregate counts
  - handling requirements
  - `noLiveDatabaseConnected: true`
  - `noSupportStatusMutated: true`
  - `commitAllowed: false`
- `support-summary.json`
  - aggregate counts by status, category, and priority
  - urgent open count
  - oldest open timestamp
  - newest exported timestamp
- `support-requests.summary.jsonl` or `support-requests.private.jsonl`
  - row-level support export in the selected mode

## Handling Rules
- Store exports only in approved operational storage.
- Do not commit exports.
- Do not attach exports to public issues, pull requests, release notes, or readiness artifacts.
- Delete exports after the review window.
- Copy only the minimum necessary summary into follow-up work items.
- Never ask users for seed phrases, private keys, recovery phrases, credentials, API tokens, or RPC URLs with credentials.

## Operator Flow
1. Keep support intake enabled for beta environments.
2. Create an API data snapshot.
3. Run the beta support export workflow in `summary` mode.
4. Review aggregate counts, urgent open requests, and recurring categories.
5. Run `private` mode only when approved support handling requires full request text.
6. Update support statuses through the internal support triage API after review.
7. Generate or update the beta data retention plan before broadening beta access.
8. Record product follow-ups without copying private request bodies into committed docs.

## Boundary
This artifact supports offline support review. It is not a ticketing system, admin dashboard, notification integration, data retention policy, or public transparency report.
