# Goal Vault CI And Release Workflows

## Purpose
This pass adds repository-owned GitHub Actions automation for the current production-shaped v1 codebase.

The CI and release-candidate workflows intentionally stop at verification and release-candidate artifact creation. Contract deployment, API runtime preflight, API image publishing, API traffic planning, Vercel API traffic command planning, managed database planning, managed database schema generation, managed database export generation, managed database import planning, managed database parity planning, managed database runtime activation planning, mobile distribution, and release manifest generation have separate guarded manual workflows. No workflow mutates backend production infrastructure or promotes traffic automatically.

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
  - uploads exact promote or rollback command strings without running Vercel CLI
  - emits manual-only disablement steps because disablement depends on project routing policy
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
6. Execute any generated `vercel promote` or `vercel rollback` command only from an approved operator environment.

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

## Operator Notes
- Keep GitHub Environment values aligned with `docs/plans/goal-vault-env-reference.md`.
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
- Use `docs/deployment/mobile-distribution.md` for EAS builds, store submission, and mobile rollback handling.
- Use `docs/deployment/release-manifest.md` to record promotion and rollback pointers before manual traffic changes.
- Add provider-specific backend execution jobs only after the staging backend host, Vercel project policy, approval model, and rollback policy are finalized.

## Deferred Automation
- Hosting-provider backend deployment
- Database provisioning, schema application, import orchestration, and live parity checks
- Traffic promotion and rollback automation
