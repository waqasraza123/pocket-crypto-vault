# Pocket Vault Beta Data Retention Plan

## Purpose
The beta data retention plan records how Pocket Vault handles application-owned beta data before expanding beyond a limited real-user audience.

It does not read live data, delete data, apply database retention policies, mutate support requests, change provider log settings, or connect to storage. It writes a reviewable JSON artifact that defines data classes, retention windows, deletion request handling, legal-hold handling, and operator review checks.

## Files
- `scripts/write-beta-data-retention-plan.mjs`
  - validates owners, artifact references, review cadence, retention windows, and non-secret notes
  - writes a data retention plan artifact
  - emits the plan path for GitHub artifact upload
- `.github/workflows/beta-data-retention-plan.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - uploads the retention plan artifact
- `package.json`
  - exposes `pnpm beta:data:retention`

## Required Inputs
- `BETA_DATA_RETENTION_TARGET`
- `BETA_DATA_RETENTION_LABEL`
- `BETA_DATA_RETENTION_POLICY_OWNER`
- `BETA_DATA_RETENTION_SUPPORT_OWNER`
- `BETA_DATA_RETENTION_INCIDENT_OWNER`
- `BETA_DATA_RETENTION_SNAPSHOT_REFERENCE`
- `BETA_DATA_RETENTION_SUPPORT_EXPORT_REFERENCE`

Optional:

- `BETA_DATA_RETENTION_READINESS_REFERENCE`
- `BETA_DATA_RETENTION_REVIEW_CADENCE`
- `BETA_DATA_RETENTION_NOTES`
- `BETA_DATA_RETENTION_DIR`

## Retention Window Inputs
Defaults:

- `BETA_DATA_RETENTION_SUPPORT_REQUESTS_DAYS=180`
- `BETA_DATA_RETENTION_SUPPORT_EXPORTS_DAYS=30`
- `BETA_DATA_RETENTION_ANALYTICS_EVENTS_DAYS=180`
- `BETA_DATA_RETENTION_API_SNAPSHOTS_DAYS=30`
- `BETA_DATA_RETENTION_MANAGED_DATABASE_EXPORTS_DAYS=14`
- `BETA_DATA_RETENTION_RELEASE_ARTIFACTS_DAYS=365`
- `BETA_DATA_RETENTION_RUNTIME_LOGS_DAYS=30`
- `BETA_DATA_RETENTION_INCIDENT_RECORDS_DAYS=730`

These windows are planning defaults. Actual deletion still requires approved operational access and a deletion procedure for the active storage provider.

## Local Usage
Example:

```bash
BETA_DATA_RETENTION_TARGET=staging \
BETA_DATA_RETENTION_LABEL=v0.1.0-beta \
BETA_DATA_RETENTION_POLICY_OWNER=ops \
BETA_DATA_RETENTION_SUPPORT_OWNER=support \
BETA_DATA_RETENTION_INCIDENT_OWNER=incident-lead \
BETA_DATA_RETENTION_SNAPSHOT_REFERENCE=pocket-vault-api-data-snapshot-staging-v0.1.0-beta \
BETA_DATA_RETENTION_SUPPORT_EXPORT_REFERENCE=pocket-vault-beta-support-export-staging \
pnpm beta:data:retention
```

## GitHub Workflow Usage
Run the `Beta Data Retention Plan` workflow manually after:

1. API data snapshot exists.
2. Beta support export exists.
3. Beta readiness evidence exists when preparing to invite users.

Download the artifact and confirm:

- `component` is `beta-data-retention-plan`
- `noLiveDataRead` is `true`
- `noDataDeleted` is `true`
- `noRetentionPolicyApplied` is `true`
- `commitAllowed` is `false`

## Artifact Contents
The plan records:

- target environment
- label
- generated timestamp
- policy owner
- support owner
- incident owner
- review cadence
- API data snapshot reference
- beta support export reference
- optional beta readiness reference
- retention windows
- data classes
- deletion request flow
- legal-hold flow
- operator checklist
- Git commit, ref, and workflow run metadata
- `commitAllowed: false`

## Data Classes
The plan covers:

- onchain vault events
- vault display metadata
- support requests
- support exports
- analytics events
- API data snapshots
- managed database exports
- release artifacts
- runtime logs
- incident records

The artifact distinguishes immutable public chain data from mutable application-owned records. Operators must not promise deletion of public onchain data.

## Deletion Request Boundary
Deletion requests should:

1. Arrive through approved support or privacy channels.
2. Verify requester control without asking for secrets.
3. Identify mutable application-owned records.
4. Avoid promising deletion of immutable public chain data.
5. Apply deletion or redaction only through approved operational access.
6. Record a minimal deletion receipt without copying private request content.

## Handling Rules
- Do not store credentials in retention artifacts.
- Do not copy private support bodies into retention artifacts.
- Keep support exports, snapshots, and managed database exports out of the repository.
- Configure provider log retention before inviting broader beta cohorts.
- Review retention exceptions during incident and legal-hold handling.

## Boundary
This phase creates a retention planning artifact. It is not a privacy policy, legal review, automated deletion job, database migration, provider configuration, or compliance certification.
