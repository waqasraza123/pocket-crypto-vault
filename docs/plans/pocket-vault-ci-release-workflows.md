# Pocket Vault CI And Release Workflows

## Purpose
This pass adds repository-owned GitHub Actions automation for the current production-shaped v1 codebase.

The CI and release-candidate workflows intentionally stop at verification and release-candidate artifact creation. Contract deployment, API runtime preflight, API image publishing, API traffic planning, Vercel API traffic command planning, beta support export generation, beta invitation wave planning, beta wave outcome reporting, beta expansion decision reporting, beta graduation decision reporting, beta data retention planning, managed database planning, managed database schema generation, managed database export generation, managed database import planning, managed database parity planning, managed database runtime activation planning, mobile distribution, release manifest generation, production activation record generation, and production observation report generation have separate guarded manual workflows. No workflow mutates backend production infrastructure or promotes traffic automatically.

## Workflow Files
- `.github/actions/setup-pnpm/action.yml`
  - shared Node `22` and pnpm `10.11.1` setup
  - frozen lockfile install
  - reused by CI and release verification
- `.github/workflows/ci.yml`
  - runs on pull requests, pushes to `dev` and `main`, and manual dispatch
  - validates workspace TypeScript
  - runs TypeScript unit tests for API, mobile, API client, and contracts SDK packages
  - runs Foundry contract tests in a dedicated job
  - exports Expo web, iOS, and Android bundles as separate matrix jobs
- `.github/workflows/release-candidate.yml`
  - manual staging or production verification
  - binds to the matching GitHub Environment
  - typechecks the workspace
  - checks deployed API readiness when `API_PUBLIC_BASE_URL` is configured
  - creates selected Expo export artifacts for web, iOS, and Android
- `.github/workflows/contracts-deploy.yml`
  - manual staging or production contract deployment
  - simulates by default
  - broadcasts only after explicit confirmation
  - validates the RPC chain ID before running Foundry deployment
  - uploads a deployment manifest after broadcast
- `.github/workflows/api-image.yml`
  - manual staging or production API image packaging
  - builds by default
  - publishes to GHCR only after explicit confirmation
  - uploads an image manifest artifact
- `.github/workflows/api-preflight.yml`
  - manual staging or production API runtime validation
  - binds to the matching GitHub Environment
  - validates target-chain RPC and factory configuration without printing secret values
  - uploads a preflight report artifact even on failure
- `.github/workflows/api-traffic-plan.yml`
  - manual staging or production API traffic plan generation
  - supports promotion, rollback, and disablement planning
  - validates non-secret URLs, image tags, artifact references, and rollback inputs
  - uploads a traffic plan artifact without moving traffic
- `.github/workflows/vercel-api-traffic-command.yml`
  - manual staging or production Vercel API traffic command plan generation
  - validates Vercel project references, deployment URLs, production domain, and traffic plan evidence
  - uploads exact promote, rollback, or alias-removal disablement command strings without running Vercel CLI
  - requires the explicit `remove-alias` strategy for disablement
- `.github/workflows/beta-support-export.yml`
  - manual staging or production beta support export generation
  - reads a downloaded API data snapshot artifact or runner-local snapshot directory
  - writes summary or explicitly confirmed private support JSONL exports
  - uploads a private operational artifact without connecting to live storage or mutating support status
- `.github/workflows/beta-invitation-wave-plan.yml`
  - manual staging or production beta invitation wave plan generation
  - validates beta readiness, stable production observation, participant counts, value guidance, support reference, incident owner, and invite owner
  - uploads a non-PII wave plan artifact without sending invitations
- `.github/workflows/beta-wave-outcome-report.yml`
  - manual staging or production beta wave outcome report generation
  - validates invitation wave, post-wave observation, aggregate counts, support reference, incident owner, and continue/pause/rollback/disable decision rules
  - uploads a non-PII outcome report artifact without sending invitations or executing recovery actions
- `.github/workflows/beta-expansion-decision-report.yml`
  - manual staging or production beta expansion decision report generation
  - validates latest wave outcome, retention plan, support load, operator capacity, review approvals, participant limits, and expansion decision rules
  - uploads a non-PII expansion decision artifact without sending invitations or reading live data
- `.github/workflows/beta-graduation-decision-report.yml`
  - manual staging or production beta graduation decision report generation
  - validates expansion decision, latest wave outcome, retention plan, aggregate signals, readiness statuses, review approvals, and graduation decision rules
  - uploads a non-PII graduation decision artifact without launching publicly
- `.github/workflows/beta-data-retention-plan.yml`
  - manual staging or production beta data retention plan generation
  - records retention windows, owners, data classes, deletion request flow, and legal-hold flow
  - uploads a planning artifact without reading live data or deleting records
- `.github/workflows/api-managed-database-plan.yml`
  - manual staging or production managed database planning
  - records current SQLite schema inventory and PostgreSQL cutover requirements
  - validates snapshot references and non-secret target reference
  - uploads a managed database plan artifact without mutating data
- `.github/workflows/api-managed-database-schema.yml`
  - manual staging or production PostgreSQL schema artifact generation
  - writes SQL DDL and a JSON manifest for the current API persistence contract
  - uploads schema artifacts without connecting to a database
- `.github/workflows/api-managed-database-export.yml`
  - manual staging or production managed database export generation
  - converts a prior API data snapshot artifact or runner-local snapshot directory into JSONL table files
  - uploads an export bundle without connecting to or importing into a managed database
- `.github/workflows/api-managed-database-import-plan.yml`
  - manual staging or production managed database import planning
  - verifies a prior managed database export artifact or runner-local export bundle
  - uploads psql-compatible import SQL and an import plan without connecting to a database
- `.github/workflows/api-managed-database-parity.yml`
  - manual staging or production parity plan generation
  - writes SQLite and PostgreSQL comparison query pairs plus acceptance gates
  - uploads a parity plan artifact without connecting to a database
- `.github/workflows/api-managed-database-runtime-plan.yml`
  - manual staging or production runtime activation plan generation
  - validates required schema, import, parity, preflight, traffic, release, image, and snapshot evidence
  - uploads a runtime plan artifact without enabling PostgreSQL mode
- `.github/workflows/mobile-distribution.yml`
  - manual staging or production EAS mobile build and submit operations
  - starts remote EAS builds in build mode
  - submits only production builds and only after explicit confirmation
  - uploads a mobile distribution manifest artifact
- `.github/workflows/release-manifest.yml`
  - manual staging or production release manifest generation
  - records the exact API image, factory address, app/API URLs, mobile build references, and rollback pointers
  - uploads a release manifest artifact
- `.github/workflows/production-activation-record.yml`
  - manual staging or production activation record generation
  - validates release, preflight, managed database, traffic execution, smoke, beta readiness, snapshot, support, and incident-owner references
  - uploads an activation record artifact without deploying, mutating a database, or moving traffic
- `.github/workflows/production-observation-report.yml`
  - manual staging or production observation report generation
  - reads public `/health` and `/ready` and records indexer, support, analytics, error budget, failed transaction, and incident signals
  - uploads an observation report artifact without deploying, mutating a database, moving traffic, or inviting users

## Required GitHub Environments
Create two GitHub Environments before relying on release-candidate runs:

- `staging`
- `production`

Production should require reviewer approval before the workflow starts. Staging can remain self-serve for operator checks.

## Environment Variables
Use GitHub Environment variables for public, non-secret release metadata:

- `EXPO_PUBLIC_APP_URL`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_TIMEOUT_MS`
- `EXPO_PUBLIC_ANALYTICS_ENABLED`
- `EXPO_PUBLIC_REOWN_PROJECT_ID`
- `EXPO_PUBLIC_WALLETCONNECT_METADATA_URL`
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
- `API_PUBLIC_BASE_URL`
- `API_HOST`
- `API_PORT`
- `API_DATA_DIR`
- `API_PERSISTENCE_DRIVER`
- `API_PERSISTENCE_SCHEMA_NAME`
- `API_SYNC_INTERVAL_MS`
- `API_ENABLE_INDEXER`
- `API_ENABLE_ANALYTICS`
- `API_ENABLE_SUPPORT`
- `API_SIGNED_REQUEST_MAX_AGE_SECONDS`
- `API_LOG_LEVEL`
- `API_BASE_START_BLOCK`
- `API_BASE_SEPOLIA_START_BLOCK`
- `API_TRAFFIC_TARGET`
- `API_TRAFFIC_ACTION`
- `API_TRAFFIC_PLAN_LABEL`
- `API_TRAFFIC_CURRENT_URL`
- `API_TRAFFIC_CANDIDATE_URL`
- `API_TRAFFIC_ROLLBACK_URL`
- `API_TRAFFIC_API_IMAGE`
- `API_TRAFFIC_ROLLBACK_API_IMAGE`
- `API_TRAFFIC_RELEASE_MANIFEST`
- `API_TRAFFIC_PREFLIGHT_REPORT`
- `API_TRAFFIC_DATA_SNAPSHOT`
- `API_TRAFFIC_CHANGE_WINDOW`
- `API_TRAFFIC_OBSERVE_MINUTES`
- `API_TRAFFIC_OPERATOR`
- `API_TRAFFIC_NOTES`
- `VERCEL_API_TRAFFIC_TARGET`
- `VERCEL_API_TRAFFIC_ACTION`
- `VERCEL_API_TRAFFIC_LABEL`
- `VERCEL_API_TRAFFIC_PLAN`
- `VERCEL_API_PROJECT`
- `VERCEL_SCOPE`
- `VERCEL_API_CANDIDATE_DEPLOYMENT_URL`
- `VERCEL_API_ROLLBACK_DEPLOYMENT_URL`
- `VERCEL_API_PRODUCTION_DOMAIN`
- `VERCEL_API_TRAFFIC_CHANGE_WINDOW`
- `VERCEL_API_TRAFFIC_OBSERVE_MINUTES`
- `VERCEL_API_TRAFFIC_OPERATOR`
- `VERCEL_API_TRAFFIC_NOTES`
- `VERCEL_API_TRAFFIC_DIR`
- `API_DATABASE_PLAN_TARGET`
- `API_DATABASE_PLAN_LABEL`
- `API_DATABASE_ENGINE`
- `API_DATABASE_TARGET_REFERENCE`
- `API_DATABASE_SOURCE_SNAPSHOT`
- `API_DATABASE_ROLLBACK_SNAPSHOT`
- `API_DATABASE_PREFLIGHT_REPORT`
- `API_DATABASE_TRAFFIC_PLAN`
- `API_DATABASE_CUTOVER_STRATEGY`
- `API_DATABASE_CHANGE_WINDOW`
- `API_DATABASE_OBSERVE_MINUTES`
- `API_DATABASE_OPERATOR`
- `API_DATABASE_NOTES`
- `API_DATABASE_PARITY_TARGET`
- `API_DATABASE_PARITY_LABEL`
- `API_DATABASE_PARITY_ENGINE`
- `API_DATABASE_PARITY_MODE`
- `API_DATABASE_PARITY_TARGET_REFERENCE`
- `API_DATABASE_PARITY_SCHEMA_NAME`
- `API_DATABASE_PARITY_SOURCE_SNAPSHOT`
- `API_DATABASE_PARITY_SCHEMA_MANIFEST`
- `API_DATABASE_PARITY_DATABASE_PLAN`
- `API_DATABASE_PARITY_SCHEMA_SQL`
- `API_DATABASE_PARITY_TRAFFIC_PLAN`
- `API_DATABASE_PARITY_OBSERVE_MINUTES`
- `API_DATABASE_PARITY_OPERATOR`
- `API_DATABASE_PARITY_NOTES`
- `API_DATABASE_PARITY_DIR`
- `API_DATABASE_EXPORT_TARGET`
- `API_DATABASE_EXPORT_LABEL`
- `API_DATABASE_EXPORT_FORMAT`
- `API_DATABASE_EXPORT_SNAPSHOT_SOURCE`
- `API_DATABASE_EXPORT_DATABASE_PLAN`
- `API_DATABASE_EXPORT_SCHEMA_MANIFEST`
- `API_DATABASE_EXPORT_PARITY_PLAN`
- `API_DATABASE_EXPORT_DIR`
- `API_DATABASE_IMPORT_TARGET`
- `API_DATABASE_IMPORT_LABEL`
- `API_DATABASE_IMPORT_ENGINE`
- `API_DATABASE_IMPORT_MODE`
- `API_DATABASE_IMPORT_TARGET_REFERENCE`
- `API_DATABASE_IMPORT_SCHEMA_NAME`
- `API_DATABASE_IMPORT_EXPORT_SOURCE`
- `API_DATABASE_IMPORT_DATABASE_PLAN`
- `API_DATABASE_IMPORT_SCHEMA_MANIFEST`
- `API_DATABASE_IMPORT_PARITY_PLAN`
- `API_DATABASE_IMPORT_CHANGE_WINDOW`
- `API_DATABASE_IMPORT_OBSERVE_MINUTES`
- `API_DATABASE_IMPORT_OPERATOR`
- `API_DATABASE_IMPORT_NOTES`
- `API_DATABASE_IMPORT_DIR`
- `API_DATABASE_RUNTIME_TARGET`
- `API_DATABASE_RUNTIME_LABEL`
- `API_DATABASE_RUNTIME_ENGINE`
- `API_DATABASE_RUNTIME_MODE`
- `API_DATABASE_RUNTIME_TARGET_REFERENCE`
- `API_DATABASE_RUNTIME_SCHEMA_NAME`
- `API_DATABASE_RUNTIME_DRIVER_PACKAGE`
- `API_DATABASE_RUNTIME_DATABASE_PLAN`
- `API_DATABASE_RUNTIME_SCHEMA_MANIFEST`
- `API_DATABASE_RUNTIME_SCHEMA_SQL`
- `API_DATABASE_RUNTIME_EXPORT_BUNDLE`
- `API_DATABASE_RUNTIME_IMPORT_PLAN`
- `API_DATABASE_RUNTIME_PARITY_PLAN`
- `API_DATABASE_RUNTIME_PREFLIGHT_REPORT`
- `API_DATABASE_RUNTIME_RELEASE_MANIFEST`
- `API_DATABASE_RUNTIME_TRAFFIC_PLAN`
- `API_DATABASE_RUNTIME_SOURCE_SNAPSHOT`
- `API_DATABASE_RUNTIME_ROLLBACK_SNAPSHOT`
- `API_DATABASE_RUNTIME_API_IMAGE`
- `API_DATABASE_RUNTIME_ROLLBACK_API_IMAGE`
- `API_DATABASE_RUNTIME_CHANGE_WINDOW`
- `API_DATABASE_RUNTIME_OBSERVE_MINUTES`
- `API_DATABASE_RUNTIME_OPERATOR`
- `API_DATABASE_RUNTIME_NOTES`
- `API_DATABASE_RUNTIME_DIR`
- `BETA_READINESS_TARGET`
- `BETA_READINESS_LABEL`
- `BETA_READINESS_PERSISTENCE_DRIVER`
- `BETA_READINESS_RELEASE_MANIFEST`
- `BETA_READINESS_PREFLIGHT_REPORT`
- `BETA_READINESS_TRAFFIC_PLAN`
- `BETA_READINESS_DATABASE_RUNTIME_PLAN`
- `BETA_READINESS_SOURCE_SNAPSHOT`
- `BETA_READINESS_ROLLBACK_SNAPSHOT`
- `BETA_READINESS_PARTICIPANT_LIMIT`
- `BETA_READINESS_MAX_VAULT_USDC`
- `BETA_READINESS_SUPPORT_REFERENCE`
- `BETA_READINESS_INCIDENT_OWNER`
- `BETA_READINESS_CHANGE_WINDOW`
- `BETA_READINESS_OBSERVE_MINUTES`
- `BETA_READINESS_OPERATOR`
- `BETA_READINESS_NOTES`
- `BETA_READINESS_DIR`
- `BETA_SUPPORT_EXPORT_TARGET`
- `BETA_SUPPORT_EXPORT_LABEL`
- `BETA_SUPPORT_EXPORT_MODE`
- `BETA_SUPPORT_EXPORT_CONFIRM_PRIVATE`
- `BETA_SUPPORT_EXPORT_SOURCE`
- `BETA_SUPPORT_EXPORT_STATUS`
- `BETA_SUPPORT_EXPORT_CATEGORY`
- `BETA_SUPPORT_EXPORT_PRIORITY`
- `BETA_SUPPORT_EXPORT_LIMIT`
- `BETA_SUPPORT_EXPORT_OPERATOR`
- `BETA_SUPPORT_EXPORT_INCIDENT_REFERENCE`
- `BETA_SUPPORT_EXPORT_NOTES`
- `BETA_SUPPORT_EXPORT_DIR`
- `BETA_INVITATION_TARGET`
- `BETA_INVITATION_WAVE_LABEL`
- `BETA_INVITATION_READINESS_PLAN`
- `BETA_INVITATION_OBSERVATION_REPORT`
- `BETA_INVITATION_WAVE_NUMBER`
- `BETA_INVITATION_WAVE_SIZE`
- `BETA_INVITATION_PREVIOUSLY_INVITED_COUNT`
- `BETA_INVITATION_PARTICIPANT_LIMIT`
- `BETA_INVITATION_MAX_VAULT_USDC`
- `BETA_INVITATION_COMMUNICATION_REFERENCE`
- `BETA_INVITATION_SUPPORT_REFERENCE`
- `BETA_INVITATION_INCIDENT_OWNER`
- `BETA_INVITATION_OWNER`
- `BETA_INVITATION_OPERATOR`
- `BETA_INVITATION_NOTES`
- `BETA_INVITATION_CONFIRM_PLAN`
- `BETA_INVITATION_DIR`
- `BETA_WAVE_OUTCOME_TARGET`
- `BETA_WAVE_OUTCOME_LABEL`
- `BETA_WAVE_OUTCOME_DECISION`
- `BETA_WAVE_OUTCOME_OBSERVATION_STATUS`
- `BETA_WAVE_OUTCOME_INVITATION_WAVE_PLAN`
- `BETA_WAVE_OUTCOME_OBSERVATION_REPORT`
- `BETA_WAVE_OUTCOME_INVITED_COUNT`
- `BETA_WAVE_OUTCOME_ACTIVATED_WALLET_COUNT`
- `BETA_WAVE_OUTCOME_VAULT_CREATED_COUNT`
- `BETA_WAVE_OUTCOME_DEPOSIT_COUNT`
- `BETA_WAVE_OUTCOME_WITHDRAW_COUNT`
- `BETA_WAVE_OUTCOME_SUPPORT_REQUEST_COUNT`
- `BETA_WAVE_OUTCOME_FAILED_TRANSACTION_COUNT`
- `BETA_WAVE_OUTCOME_INCIDENT_COUNT`
- `BETA_WAVE_OUTCOME_PARTICIPANT_IDENTIFIERS_RECORDED`
- `BETA_WAVE_OUTCOME_SUPPORT_REFERENCE`
- `BETA_WAVE_OUTCOME_INCIDENT_OWNER`
- `BETA_WAVE_OUTCOME_INCIDENT_REFERENCE`
- `BETA_WAVE_OUTCOME_OPERATOR`
- `BETA_WAVE_OUTCOME_NOTES`
- `BETA_WAVE_OUTCOME_CONFIRM_REPORT`
- `BETA_WAVE_OUTCOME_DIR`
- `BETA_EXPANSION_TARGET`
- `BETA_EXPANSION_LABEL`
- `BETA_EXPANSION_DECISION`
- `BETA_EXPANSION_LATEST_WAVE_OUTCOME`
- `BETA_EXPANSION_RETENTION_PLAN`
- `BETA_EXPANSION_CURRENT_PARTICIPANT_COUNT`
- `BETA_EXPANSION_NEXT_WAVE_SIZE`
- `BETA_EXPANSION_PARTICIPANT_LIMIT`
- `BETA_EXPANSION_OPEN_SUPPORT_REQUEST_COUNT`
- `BETA_EXPANSION_UNRESOLVED_INCIDENT_COUNT`
- `BETA_EXPANSION_FAILED_TRANSACTION_COUNT`
- `BETA_EXPANSION_SUPPORT_BACKLOG_STATUS`
- `BETA_EXPANSION_OPERATOR_CAPACITY_STATUS`
- `BETA_EXPANSION_RETENTION_REVIEW_ACCEPTED`
- `BETA_EXPANSION_SUPPORT_REVIEW_ACCEPTED`
- `BETA_EXPANSION_PRIVACY_REVIEW_ACCEPTED`
- `BETA_EXPANSION_PARTICIPANT_IDENTIFIERS_RECORDED`
- `BETA_EXPANSION_SUPPORT_REFERENCE`
- `BETA_EXPANSION_INCIDENT_OWNER`
- `BETA_EXPANSION_OWNER`
- `BETA_EXPANSION_INCIDENT_REFERENCE`
- `BETA_EXPANSION_OPERATOR`
- `BETA_EXPANSION_NOTES`
- `BETA_EXPANSION_CONFIRM_REPORT`
- `BETA_EXPANSION_DIR`
- `BETA_GRADUATION_TARGET`
- `BETA_GRADUATION_LABEL`
- `BETA_GRADUATION_DECISION`
- `BETA_GRADUATION_EXPANSION_DECISION`
- `BETA_GRADUATION_LATEST_WAVE_OUTCOME`
- `BETA_GRADUATION_RETENTION_PLAN`
- `BETA_GRADUATION_PARTICIPANT_COUNT`
- `BETA_GRADUATION_MINIMUM_PARTICIPANT_COUNT`
- `BETA_GRADUATION_OPEN_SUPPORT_REQUEST_COUNT`
- `BETA_GRADUATION_UNRESOLVED_INCIDENT_COUNT`
- `BETA_GRADUATION_FAILED_TRANSACTION_COUNT`
- `BETA_GRADUATION_SUPPORT_READINESS`
- `BETA_GRADUATION_PRIVACY_READINESS`
- `BETA_GRADUATION_RELIABILITY_READINESS`
- `BETA_GRADUATION_COMMUNICATIONS_READINESS`
- `BETA_GRADUATION_STORE_READINESS`
- `BETA_GRADUATION_SUPPORT_REVIEW_ACCEPTED`
- `BETA_GRADUATION_PRIVACY_REVIEW_ACCEPTED`
- `BETA_GRADUATION_RELIABILITY_REVIEW_ACCEPTED`
- `BETA_GRADUATION_RETENTION_REVIEW_ACCEPTED`
- `BETA_GRADUATION_COMMUNICATIONS_REVIEW_ACCEPTED`
- `BETA_GRADUATION_PARTICIPANT_IDENTIFIERS_RECORDED`
- `BETA_GRADUATION_SUPPORT_REFERENCE`
- `BETA_GRADUATION_INCIDENT_OWNER`
- `BETA_GRADUATION_OWNER`
- `BETA_GRADUATION_INCIDENT_REFERENCE`
- `BETA_GRADUATION_OPERATOR`
- `BETA_GRADUATION_NOTES`
- `BETA_GRADUATION_CONFIRM_REPORT`
- `BETA_GRADUATION_DIR`
- `BETA_DATA_RETENTION_TARGET`
- `BETA_DATA_RETENTION_LABEL`
- `BETA_DATA_RETENTION_POLICY_OWNER`
- `BETA_DATA_RETENTION_SUPPORT_OWNER`
- `BETA_DATA_RETENTION_INCIDENT_OWNER`
- `BETA_DATA_RETENTION_SNAPSHOT_REFERENCE`
- `BETA_DATA_RETENTION_SUPPORT_EXPORT_REFERENCE`
- `BETA_DATA_RETENTION_READINESS_REFERENCE`
- `BETA_DATA_RETENTION_REVIEW_CADENCE`
- `BETA_DATA_RETENTION_SUPPORT_REQUESTS_DAYS`
- `BETA_DATA_RETENTION_SUPPORT_EXPORTS_DAYS`
- `BETA_DATA_RETENTION_ANALYTICS_EVENTS_DAYS`
- `BETA_DATA_RETENTION_API_SNAPSHOTS_DAYS`
- `BETA_DATA_RETENTION_MANAGED_DATABASE_EXPORTS_DAYS`
- `BETA_DATA_RETENTION_RELEASE_ARTIFACTS_DAYS`
- `BETA_DATA_RETENTION_RUNTIME_LOGS_DAYS`
- `BETA_DATA_RETENTION_INCIDENT_RECORDS_DAYS`
- `BETA_DATA_RETENTION_NOTES`
- `BETA_DATA_RETENTION_DIR`
- `PRODUCTION_ACTIVATION_TARGET`
- `PRODUCTION_ACTIVATION_LABEL`
- `PRODUCTION_ACTIVATION_OUTCOME`
- `PRODUCTION_ACTIVATION_PERSISTENCE_DRIVER`
- `PRODUCTION_ACTIVATION_RELEASE_MANIFEST`
- `PRODUCTION_ACTIVATION_PREFLIGHT_REPORT`
- `PRODUCTION_ACTIVATION_DATABASE_RUNTIME_PLAN`
- `PRODUCTION_ACTIVATION_SCHEMA_EXECUTION`
- `PRODUCTION_ACTIVATION_IMPORT_EXECUTION`
- `PRODUCTION_ACTIVATION_PARITY_EXECUTION`
- `PRODUCTION_ACTIVATION_TRAFFIC_PLAN`
- `PRODUCTION_ACTIVATION_TRAFFIC_EXECUTION`
- `PRODUCTION_ACTIVATION_SMOKE_RESULT`
- `PRODUCTION_ACTIVATION_BETA_READINESS`
- `PRODUCTION_ACTIVATION_SOURCE_SNAPSHOT`
- `PRODUCTION_ACTIVATION_ROLLBACK_SNAPSHOT`
- `PRODUCTION_ACTIVATION_SUPPORT_REFERENCE`
- `PRODUCTION_ACTIVATION_INCIDENT_OWNER`
- `PRODUCTION_ACTIVATION_CHANGE_WINDOW`
- `PRODUCTION_ACTIVATION_OBSERVE_MINUTES`
- `PRODUCTION_ACTIVATION_OPERATOR`
- `PRODUCTION_ACTIVATION_NOTES`
- `PRODUCTION_ACTIVATION_CONFIRM_RECORD`
- `PRODUCTION_ACTIVATION_DIR`
- `PRODUCTION_OBSERVATION_TARGET`
- `PRODUCTION_OBSERVATION_LABEL`
- `PRODUCTION_OBSERVATION_STATUS`
- `PRODUCTION_OBSERVATION_PERSISTENCE_DRIVER`
- `PRODUCTION_OBSERVATION_API_BASE_URL`
- `PRODUCTION_OBSERVATION_ACTIVATION_RECORD`
- `PRODUCTION_OBSERVATION_MINUTES`
- `PRODUCTION_OBSERVATION_TIMEOUT_MS`
- `PRODUCTION_OBSERVATION_INDEXER_STATUS`
- `PRODUCTION_OBSERVATION_SUPPORT_STATUS`
- `PRODUCTION_OBSERVATION_ANALYTICS_STATUS`
- `PRODUCTION_OBSERVATION_ERROR_BUDGET_STATUS`
- `PRODUCTION_OBSERVATION_SUPPORT_REQUEST_COUNT`
- `PRODUCTION_OBSERVATION_FAILED_TRANSACTION_COUNT`
- `PRODUCTION_OBSERVATION_INCIDENT_COUNT`
- `PRODUCTION_OBSERVATION_SUPPORT_REFERENCE`
- `PRODUCTION_OBSERVATION_INCIDENT_OWNER`
- `PRODUCTION_OBSERVATION_INCIDENT_REFERENCE`
- `PRODUCTION_OBSERVATION_OPERATOR`
- `PRODUCTION_OBSERVATION_NOTES`
- `PRODUCTION_OBSERVATION_CONFIRM`
- `PRODUCTION_OBSERVATION_DIR`
- `API_DATABASE_SCHEMA_TARGET`
- `API_DATABASE_SCHEMA_LABEL`
- `API_DATABASE_SCHEMA_ENGINE`
- `API_DATABASE_SCHEMA_NAME`
- `API_DATABASE_SCHEMA_SOURCE_PLAN`
- `API_DATABASE_SCHEMA_DIR`
- `IOS_BUILD_NUMBER`
- `ANDROID_VERSION_CODE`

Use GitHub Environment secrets for RPC URLs and protected execution credentials:

- `API_DATABASE_URL`
- `EXPO_PUBLIC_BASE_RPC_URL`
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`
- `CONTRACT_DEPLOY_RPC_URL`
- `CONTRACT_DEPLOYER_PRIVATE_KEY`
- `API_INTERNAL_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Contract deployment also requires `USDC_ADDRESS` as a GitHub Environment variable.

The Vercel command plan workflow records required Vercel secret names but does not read them or execute Vercel CLI.
The current workflows do not require app-store credentials or backend deploy keys in repository secrets.
Mobile distribution requires `EXPO_TOKEN` as a GitHub Environment secret. Store credentials are managed in EAS, not in repository secrets.

## Pull Request Gate
The CI workflow is the default repository quality gate:

1. Install with the pinned workspace toolchain.
2. Typecheck all packages through Turbo.
3. Run package unit tests that execute under Node or `tsx`.
4. Run Foundry tests separately with the Foundry toolchain.
5. Export each Expo platform independently so one platform failure is visible without hiding the others.

## Release Candidate Gate
Use the manual release-candidate workflow before staging or production handoff:

1. Choose `staging` or `production`.
2. Keep all exports enabled for a full candidate.
3. Disable a platform export only when intentionally checking a narrower candidate.
4. Review `/ready` output from the deployed API when `API_PUBLIC_BASE_URL` is configured.
5. Download and inspect artifacts from the completed run.

## Contract Deployment Gate
Use the manual contract deployment workflow only after the relevant environment is configured:

1. Choose `staging` or `production`.
2. Run `simulate` first.
3. Review chain ID, USDC address, and expected deployer account.
4. Run `broadcast` only with `confirm_broadcast` set to `deploy`.
5. Download the deployment manifest artifact and copy the factory address into app/API environment configuration.

## API Image Gate
Use the manual API image workflow when the API release candidate is ready:

1. Choose `staging` or `production`.
2. Run `build` mode first.
3. Run `publish` only with `confirm_publish` set to `publish`.
4. Download the image manifest artifact.
5. Deploy the published image manually on the selected backend host.

## API Preflight Gate
Use the manual API preflight workflow before deploying or promoting a backend image:

1. Choose `staging` or `production`.
2. Confirm the target GitHub Environment has API variables and secrets configured.
3. Run `API Preflight`.
4. Download the preflight report artifact.
5. Confirm `API_PERSISTENCE_DRIVER=sqlite`, or confirm PostgreSQL preflight passes connection and schema checks before any managed database cutover.
6. Fix any validation errors before API image deployment or traffic movement.

## Beta Readiness Gate
Use the manual beta readiness workflow before inviting real users:

1. Choose `staging` or `production`.
2. Provide release manifest, API preflight, traffic plan, source snapshot, rollback snapshot, support reference, incident owner, participant limit, and maximum recommended vault amount.
3. Provide the managed database runtime plan when PostgreSQL persistence is selected.
4. Download the readiness artifact and review launch and rollback steps with the operator before sending beta invites.

## Beta Support Export Gate
Use the manual beta support export workflow when operators need offline support review:

1. Choose `staging` or `production`.
2. Provide an API data snapshot artifact plus run ID, or a runner-local snapshot directory.
3. Use `summary` mode for routine review.
4. Use `private` mode only with `confirm_private=export-private-support` when full request text or contact details are needed.
5. Download the export artifact and confirm the manifest says `commitAllowed: false`, `noLiveDatabaseConnected: true`, and `noSupportStatusMutated: true`.
6. Update request statuses through the internal support triage API after review.

## Beta Invitation Wave Gate
Use the manual beta invitation wave workflow after beta readiness and a stable observation report:

1. Choose `staging` or `production`.
2. Provide beta readiness, stable observation report, wave number, wave size, previously invited count, value guidance, communication reference, support reference, incident owner, and invite owner.
3. Set `confirm_plan` to `plan`.
4. Download the wave plan and confirm it says `noInvitesSent: true`.
5. Confirm the plan contains no participant names, emails, wallet addresses, social handles, invite links, or contact details.
6. Send invitations only from the approved private operational system after reviewing the plan.

## Beta Wave Outcome Gate
Use the manual beta wave outcome workflow after a wave observation window:

1. Choose `staging` or `production`.
2. Provide the invitation wave plan, post-wave observation report, decision, aggregate invited, activation, vault, deposit, withdraw, support, failed transaction, and incident counts.
3. Confirm `participant_identifiers_recorded=false`.
4. Set `confirm_report` to `report`.
5. Download the outcome report and confirm it contains aggregate counts only.
6. Approve the next invitation wave only when the outcome decision is `continue`.

## Beta Expansion Decision Gate
Use the manual beta expansion decision workflow before a larger invitation wave:

1. Choose `staging` or `production`.
2. Provide the latest wave outcome, retention plan, current participant count, proposed next wave size, participant limit, support load, incident count, failed transaction count, support backlog status, operator capacity, and review approvals.
3. Confirm `participant_identifiers_recorded=false`.
4. Set `confirm_report` to `report`.
5. Download the expansion decision report and confirm it contains aggregate counts only.
6. Generate the next observation report and invitation wave plan only when the decision is `expand`.

## Beta Graduation Decision Gate
Use the manual beta graduation decision workflow before public launch planning:

1. Choose `staging` or `production`.
2. Provide the expansion decision, latest wave outcome, retention plan, participant count, minimum sample, support count, incident count, failed transaction count, readiness statuses, and review approvals.
3. Confirm `participant_identifiers_recorded=false`.
4. Set `confirm_report` to `report`.
5. Download the graduation decision report and confirm it contains aggregate counts only.
6. Begin public launch planning only when the decision is `graduate`.

## Beta Data Retention Gate
Use the manual beta data retention plan workflow before expanding beyond limited beta:

1. Choose `staging` or `production`.
2. Provide policy, support, and incident owners.
3. Provide API data snapshot and beta support export references.
4. Keep the default retention windows unless an operator has approved a stricter target-specific policy.
5. Download the retention artifact and confirm it says `commitAllowed: false`, `noLiveDataRead: true`, `noDataDeleted: true`, and `noRetentionPolicyApplied: true`.
6. Review deletion request and legal-hold handling before inviting a broader beta cohort.

## API Traffic Plan Gate
Use the manual API traffic plan workflow before provider-specific traffic changes:

1. Choose `staging` or `production`.
2. Choose `promote`, `rollback`, or `disable`.
3. Provide a stable plan label.
4. For promotion, provide candidate URL, rollback URL, candidate image, rollback image, release manifest reference, API preflight report reference, and API data snapshot reference.
5. Download the traffic plan artifact and review the steps with the hosting-provider operator.

## Vercel API Traffic Command Gate
Use the manual Vercel API traffic command workflow after the provider-neutral API traffic plan:

1. Choose `staging` or `production`.
2. Choose `promote`, `rollback`, or `disable`.
3. Provide the reviewed API traffic plan reference.
4. Provide the non-secret Vercel project reference, optional scope, production API domain, and deployment URLs required by the selected action.
5. Download the command plan artifact and confirm it says `noDeploymentPerformed: true` and `noTrafficMoved: true`.
6. Execute any generated `vercel promote`, `vercel rollback`, or `vercel alias rm` command only from an approved operator environment.

## API Managed Database Plan Gate
Use the manual API managed database plan workflow before external database work:

1. Choose `staging` or `production`.
2. Provide a stable plan label.
3. Provide a non-secret managed database target reference.
4. Provide source and rollback API data snapshot references.
5. Choose `cold-cutover` or `shadow-restore`.
6. Download the managed database plan artifact and review schema inventory, data classification, cutover steps, and rollback requirements.

## API Managed Database Schema Gate
Use the manual API managed database schema workflow before applying provider-specific DDL:

1. Choose `staging` or `production`.
2. Provide a stable schema label.
3. Provide the PostgreSQL schema name.
4. Optionally reference the managed database plan artifact.
5. Download the SQL and JSON manifest artifacts for review.

## API Managed Database Export Gate
Use the manual API managed database export workflow after a data snapshot and schema review exist:

1. Choose `staging` or `production`.
2. Provide a stable export label.
3. Provide either `snapshot_artifact` with `snapshot_run_id` or a runner-local `snapshot_source`.
4. Optionally reference the managed database plan, schema manifest, and parity plan artifacts.
5. Download the export bundle and review its manifest, row counts, checksums, and data classification before any import.

## API Managed Database Import Plan Gate
Use the manual API managed database import plan workflow after an export bundle is reviewed:

1. Choose `staging` or `production`.
2. Provide a stable import label.
3. Choose `initial-import`, `retry-import`, or `rollback-restore`.
4. Provide a non-secret managed database target reference and PostgreSQL schema name.
5. Provide either `export_artifact` with `export_run_id` or a runner-local `export_source`.
6. Download the import plan and SQL artifacts for review before provider-owned execution.

## API Managed Database Parity Gate
Use the manual API managed database parity workflow before promoting a managed-database-backed API:

1. Choose `staging` or `production`.
2. Provide a stable parity label.
3. Choose `restore-validation`, `pre-traffic`, or `post-rollback`.
4. Provide the PostgreSQL schema name used by the schema bundle.
5. Provide source snapshot or export bundle and schema manifest references.
6. Download the parity plan artifact and run the emitted query pairs through approved operational access.

## API Managed Database Runtime Plan Gate
Use the manual API managed database runtime plan workflow before enabling PostgreSQL as the API runtime persistence mode:

1. Choose `staging` or `production`.
2. Provide a stable runtime label.
3. Choose `shadow`, `cutover`, or `rollback-drill`.
4. Provide the non-secret managed database target reference, PostgreSQL schema name, planned driver package label, candidate and rollback API images, source and rollback snapshots, and all managed database artifact references.
5. Download the runtime plan artifact and review acceptance gates before adding runtime factory wiring or moving traffic.

## Mobile Distribution Gate
Use the manual mobile distribution workflow after app, API, and contract release candidates are coherent:

1. Choose `staging` or `production`.
2. Run `build` mode first.
3. Use `preview` builds for staging and `production` builds for production.
4. Run `submit` only for production with `confirm_submit` set to `submit`.
5. Review EAS build logs, store metadata, and rollout controls outside GitHub.

## Release Manifest Gate
Use the manual release manifest workflow before traffic movement:

1. Choose `staging` or `production`.
2. Provide a release label and exact API image tag.
3. Add mobile build references when available.
4. Add rollback API image and previous factory address when relevant.
5. Save the manifest artifact with release notes.

## Production Activation Record Gate
Use the manual production activation record workflow after traffic execution, protected smoke, and beta readiness evidence exist:

1. Choose `staging` or `production`.
2. Provide a stable activation label and final outcome.
3. Provide release manifest, API preflight, managed database runtime, schema execution, import execution, parity execution, traffic plan, traffic execution, smoke, beta readiness, source snapshot, rollback snapshot, support reference, and incident owner.
4. Set `confirm_record` to `record`.
5. Download the activation record and store it with release evidence before expanding beta invitations.

## Production Observation Report Gate
Use the manual production observation report workflow after an activation record is accepted and before beta invitation expansion:

1. Choose `staging` or `production`.
2. Provide a stable observation label, accepted activation record, public API URL, support reference, incident owner, and operational signal counts.
3. Use `stable` only when public `/health`, public `/ready`, indexer, support, analytics, error budget, and incident signals are accepted.
4. Use `degraded` or `incident` when beta expansion should pause for operator review.
5. Set `confirm_observe` to `observe`.
6. Download the observation report and store it with activation evidence before expanding the invitation wave.

## Operator Notes
- Keep GitHub Environment values aligned with `docs/plans/pocket-vault-env-reference.md`.
- Keep production approval on the GitHub Environment instead of adding custom approval logic to workflow YAML.
- Treat release-candidate artifacts as verification outputs, not deployable store releases.
- Use `docs/deployment/contract-deployment.md` for contract simulation, broadcast, post-deploy config, and rollback handling.
- Use `docs/deployment/api-image.md` for API image build, publish, runtime config, promotion, and rollback handling.
- Use `docs/deployment/api-managed-database-plan.md` for external database migration planning before provider-specific work.
- Use `docs/deployment/api-managed-database-parity.md` for SQLite/PostgreSQL parity planning before traffic movement.
- Use `docs/deployment/api-managed-database-schema.md` for provider-neutral PostgreSQL DDL artifacts.
- Use `docs/deployment/api-managed-database-export.md` for SQLite snapshot to JSONL export bundles before provider-owned import.
- Use `docs/deployment/api-managed-database-import-plan.md` for generated PostgreSQL import SQL and execution boundaries.
- Use `docs/deployment/api-preflight.md` for API runtime env validation before backend deployment.
- Use `docs/deployment/api-traffic-plan.md` for provider-neutral traffic movement, rollback, and disablement planning.
- Use `docs/deployment/vercel-api-traffic.md` for Vercel-specific command planning after a provider-neutral traffic plan exists.
- Use `docs/deployment/production-activation-record.md` for post-cutover acceptance, rollback, or disablement evidence.
- Use `docs/deployment/production-observation-report.md` for post-activation observation windows before beta expansion.
- Use `docs/deployment/beta-invitation-wave.md` for non-PII invitation wave approval before sending beta invites.
- Use `docs/deployment/beta-wave-outcome.md` for aggregate invite-wave outcome decisions before the next wave.
- Use `docs/deployment/beta-expansion-decision.md` for broader beta expansion decisions after wave outcomes.
- Use `docs/deployment/beta-graduation-decision.md` for beta graduation decisions before public launch planning.
- Use `docs/deployment/beta-support-export.md` for offline support review from API data snapshots.
- Use `docs/deployment/beta-data-retention.md` for retention-window planning before broader beta expansion.
- Use `docs/deployment/mobile-distribution.md` for EAS builds, store submission, and mobile rollback handling.
- Use `docs/deployment/release-manifest.md` to record promotion and rollback pointers before manual traffic changes.
- Add provider-specific backend execution jobs only after the staging backend host, Vercel project policy, approval model, and rollback policy are finalized.

## Deferred Automation
- Hosting-provider backend deployment
- Database provisioning, schema application, import orchestration, and live parity checks
- Traffic promotion and rollback automation
