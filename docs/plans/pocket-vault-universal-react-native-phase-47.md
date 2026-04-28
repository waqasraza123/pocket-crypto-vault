# Pocket Vault Universal React Native Phase 47

## Scope
Phase 47 adds a guarded beta support export artifact for offline operator review.

The goal is to make real-audience beta support operationally useful without requiring direct database access, live API reads, or public handling of private support content.

## Implemented
- Added `scripts/write-beta-support-export.mjs`.
- Added `pnpm beta:support:export`.
- Added `.github/workflows/beta-support-export.yml`.
- Added `docs/deployment/beta-support-export.md`.
- Updated launch, release workflow, support intake, and project-state docs.

## Export Behavior
The script reads an API data snapshot and writes:

- `manifest.json`
- `support-summary.json`
- `support-requests.summary.jsonl` in summary mode
- `support-requests.private.jsonl` in private mode

The manifest records:

- `component: "beta-support-export"`
- `noLiveDatabaseConnected: true`
- `noSupportStatusMutated: true`
- `commitAllowed: false`
- snapshot manifest and checksum evidence
- filter values
- output checksums
- aggregate support counts
- handling requirements

## Validation
The script validates:

- target is `staging` or `production`
- mode is `summary` or `private`
- private mode has explicit confirmation
- snapshot source exists
- snapshot manifest is a Pocket Vault API data snapshot
- analytics SQLite snapshot checksum matches the manifest
- `support_requests` exists
- filters are known support values
- limit is a positive integer no greater than 1000
- operator notes and incident references do not contain credential-like text

## Boundaries
This phase does not:

- connect to a live database
- call internal support APIs
- mutate support request status
- send email or create external tickets
- upload public reports
- run builds, real test suites, Expo exports, deployment, Vercel CLI, contract work, traffic movement, database provisioning, schema application, import, or parity comparison

## Next Steps
- Decide whether support exports should feed a ticketing integration or remain a manual beta operation.
- Add reviewer-protected Vercel command execution only after the approval model is finalized.
- Add production data retention guidance before moving beyond limited beta.
