# Goal Vault CI And Release Workflows

## Purpose
This pass adds repository-owned GitHub Actions automation for the current production-shaped v1 codebase.

The CI and release-candidate workflows intentionally stop at verification and release-candidate artifact creation. Contract deployment, API image publishing, and mobile distribution have separate guarded manual workflows. No workflow mutates backend production infrastructure or promotes traffic automatically.

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
- `.github/workflows/mobile-distribution.yml`
  - manual staging or production EAS mobile build and submit operations
  - starts remote EAS builds in build mode
  - submits only production builds and only after explicit confirmation
  - uploads a mobile distribution manifest artifact

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
- `CONTRACT_DEPLOY_RPC_URL`
- `CONTRACT_DEPLOYER_PRIVATE_KEY`

Contract deployment also requires `USDC_ADDRESS` as a GitHub Environment variable.

The current workflows do not require app-store credentials, backend deploy keys, or backend internal sync tokens in repository secrets.
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

## Mobile Distribution Gate
Use the manual mobile distribution workflow after app, API, and contract release candidates are coherent:

1. Choose `staging` or `production`.
2. Run `build` mode first.
3. Use `preview` builds for staging and `production` builds for production.
4. Run `submit` only for production with `confirm_submit` set to `submit`.
5. Review EAS build logs, store metadata, and rollout controls outside GitHub.

## Operator Notes
- Keep GitHub Environment values aligned with `docs/plans/goal-vault-env-reference.md`.
- Keep production approval on the GitHub Environment instead of adding custom approval logic to workflow YAML.
- Treat release-candidate artifacts as verification outputs, not deployable store releases.
- Use `docs/deployment/contract-deployment.md` for contract simulation, broadcast, post-deploy config, and rollback handling.
- Use `docs/deployment/api-image.md` for API image build, publish, runtime config, promotion, and rollback handling.
- Use `docs/deployment/mobile-distribution.md` for EAS builds, store submission, and mobile rollback handling.
- Add backend promotion jobs only after the staging backend and rollback policy are finalized.

## Deferred Automation
- Hosting-provider backend deployment
- Database migration orchestration
- Traffic promotion and rollback automation
