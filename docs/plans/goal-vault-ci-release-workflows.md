# Goal Vault CI And Release Workflows

## Purpose
This pass adds repository-owned GitHub Actions automation for the current production-shaped v1 codebase.

The workflows intentionally stop at verification and release-candidate artifact creation. They do not deploy contracts, publish mobile store builds, mutate production infrastructure, or promote traffic automatically.

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
- `IOS_BUILD_NUMBER`
- `ANDROID_VERSION_CODE`

Use GitHub Environment secrets for RPC URLs:

- `EXPO_PUBLIC_BASE_RPC_URL`
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`

The current workflows do not require private deploy keys, EAS tokens, app-store credentials, contract deployer keys, or backend internal sync tokens.

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

## Operator Notes
- Keep GitHub Environment values aligned with `docs/plans/goal-vault-env-reference.md`.
- Keep production approval on the GitHub Environment instead of adding custom approval logic to workflow YAML.
- Treat release-candidate artifacts as verification outputs, not deployable store releases.
- Add deployment and promotion jobs only after the staging backend, contract deployment process, and mobile distribution channel are finalized.

## Deferred Automation
- Automatic contract deployment
- EAS cloud builds and app-store submission
- Production backend deployment
- Database migration orchestration
- Traffic promotion and rollback automation
