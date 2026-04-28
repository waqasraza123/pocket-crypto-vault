# Pocket Vault Mobile Distribution

## Purpose
This runbook covers the guarded EAS workflow for mobile build and store submission operations.

The workflow creates remote EAS build jobs and can submit the latest successful production build. It does not change backend traffic, deploy contracts, mutate API hosting, or bypass store review.

## Files
- `apps/mobile/eas.json`
  - owns mobile EAS build and submit profiles beside the Expo app config
  - maps `preview` to staging env
  - maps `production` to production env
- `apps/mobile/.easignore`
  - excludes local build output, native generated folders, local dependencies, and secrets from EAS uploads
- `.github/workflows/mobile-distribution.yml`
  - manual workflow for EAS build or submit
  - binds to `staging` or `production` GitHub Environments
  - submits only for production and only with explicit confirmation
  - uploads a distribution manifest artifact

## GitHub Environment Setup
Required secret:

- `EXPO_TOKEN`

Required variables:

- `EXPO_PUBLIC_APP_URL`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_TIMEOUT_MS`
- `EXPO_PUBLIC_ANALYTICS_ENABLED`
- `EXPO_PUBLIC_REOWN_PROJECT_ID`
- `EXPO_PUBLIC_WALLETCONNECT_METADATA_URL`
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
- `IOS_BUILD_NUMBER`
- `ANDROID_VERSION_CODE`

Required secrets:

- `EXPO_PUBLIC_BASE_RPC_URL`
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`

Production should require GitHub Environment reviewer approval before the job starts.

## Build Mode
Use build mode to create remote EAS jobs:

- `target`: `staging` or `production`
- `platform`: `ios`, `android`, or `all`
- `mode`: `build`
- `confirm_submit`: empty

The workflow maps targets to profiles:

- `staging` -> `preview`
- `production` -> `production`

The workflow uses `--no-wait`, so completion and binary download remain in EAS. Use EAS dashboards for build logs, signing details, and artifacts.

## Submit Mode
Use submit mode only for production store submission:

- `target`: `production`
- `platform`: `ios`, `android`, or `all`
- `mode`: `submit`
- `confirm_submit`: `submit`

The workflow submits the latest successful production build with the `production` submit profile.

Before using submit mode:

- confirm App Store Connect and Google Play credentials are configured in EAS
- confirm the latest production build is the intended binary
- confirm product copy, screenshots, privacy details, and support URLs are ready in the stores
- confirm release-candidate, API image, and contract deployment checks are complete

## Manifest Artifact
Each run uploads:

- `pocket-vault-mobile-<target>-<platform>-<mode>.json`

The manifest includes:

- target environment
- platform
- mode
- EAS build profile
- EAS submit profile
- commit SHA
- GitHub workflow run ID
- generation timestamp

## Rollback Reality
Mobile rollback is store-specific:

- iOS rollback usually means stopping phased release, submitting a fixed build, or adjusting availability
- Android rollback may use staged rollout controls or a fixed build
- users who already installed a binary may keep running it until an update is installed

Do not submit a production binary until backend and contract configuration are stable enough for installed clients.
