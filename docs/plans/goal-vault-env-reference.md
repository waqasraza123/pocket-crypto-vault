# Goal Vault Env Reference

## Shared App Variables
- `APP_ENV`
  - `development`, `staging`, or `production`
- `EXPO_PUBLIC_APP_ENV`
  - should match `APP_ENV`
- `EXPO_PUBLIC_APP_URL`
  - public web/app URL used for staging or production packaging
- `EXPO_PUBLIC_API_BASE_URL`
  - public API base URL used by the app
- `EXPO_PUBLIC_API_TIMEOUT_MS`
  - app-side backend timeout in milliseconds
- `EXPO_PUBLIC_ANALYTICS_ENABLED`
  - `true` or `false`; when enabled the app emits typed product events through the analytics boundary
- `EXPO_PUBLIC_REOWN_PROJECT_ID`
  - wallet project ID for real wallet flows
- `EXPO_PUBLIC_WALLETCONNECT_METADATA_URL`
  - wallet metadata URL; defaults to `EXPO_PUBLIC_APP_URL` when available

## Chain Variables
- `EXPO_PUBLIC_BASE_RPC_URL`
  - Base mainnet RPC URL
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
  - Base mainnet Goal Vault factory address
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`
  - Base Sepolia RPC URL
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
  - Base Sepolia Goal Vault factory address

## Contract Deployment Variables
- `USDC_ADDRESS`
  - USDC contract address used by the `GoalVaultFactory` deployment script for the selected GitHub Environment
- `CONTRACT_DEPLOY_RPC_URL`
  - secret RPC URL used by the guarded contract deployment workflow
- `CONTRACT_DEPLOYER_PRIVATE_KEY`
  - secret deployer private key used by Foundry only inside the guarded contract deployment workflow

## API Variables
- `API_HOST`
  - bind host, defaults to `127.0.0.1`
- `API_PORT`
  - API port, defaults to `3001`
- `API_PUBLIC_BASE_URL`
  - public API URL for deployment readiness and operator checks
- `API_DATA_DIR`
  - file-backed indexer data directory
- `API_PREFLIGHT_OUTPUT`
  - optional output path for the redacted API runtime preflight report
- `API_SYNC_INTERVAL_MS`
  - background sync interval in milliseconds
- `API_ENABLE_INDEXER`
  - `true` or `false`
- `API_ENABLE_ANALYTICS`
  - `true` or `false`; stores app analytics batches to the API-side NDJSON file for post-launch review
- `API_INTERNAL_TOKEN`
  - internal sync and status token; required outside development and stored as a GitHub Environment secret
- `API_SIGNED_REQUEST_MAX_AGE_SECONDS`
  - maximum accepted age for signed metadata requests
- `API_LOG_LEVEL`
  - one of `fatal`, `error`, `warn`, `info`, `debug`, `trace`
- `API_BASE_START_BLOCK`
  - optional Base sync starting block
- `API_BASE_SEPOLIA_START_BLOCK`
  - optional Base Sepolia sync starting block

## API Image Variables
- `API_HOST`
  - use `0.0.0.0` inside container hosting
- `API_DATA_DIR`
  - should point to mounted durable storage before relying on SQLite-backed indexed state

## API Preflight Variables
- `API_PREFLIGHT_OUTPUT`
  - artifact path for the preflight report
- `API_INTERNAL_TOKEN`
  - reported only as configured or missing
- `EXPO_PUBLIC_BASE_RPC_URL`
  - reported only as configured or missing
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`
  - reported only as configured or missing

## API Traffic Plan Variables
- `API_TRAFFIC_TARGET`
  - `staging` or `production`
- `API_TRAFFIC_ACTION`
  - `promote`, `rollback`, or `disable`
- `API_TRAFFIC_PLAN_LABEL`
  - stable label used in artifact naming
- `API_TRAFFIC_CURRENT_URL`
  - current public API URL
- `API_TRAFFIC_CANDIDATE_URL`
  - candidate API URL for promotion
- `API_TRAFFIC_ROLLBACK_URL`
  - previous known-good API URL
- `API_TRAFFIC_API_IMAGE`
  - candidate API image reference with explicit tag
- `API_TRAFFIC_ROLLBACK_API_IMAGE`
  - previous known-good API image reference with explicit tag
- `API_TRAFFIC_RELEASE_MANIFEST`
  - release manifest artifact name or URL
- `API_TRAFFIC_PREFLIGHT_REPORT`
  - API preflight report artifact name or URL
- `API_TRAFFIC_DATA_SNAPSHOT`
  - API data snapshot artifact name or approved storage reference
- `API_TRAFFIC_CHANGE_WINDOW`
  - approved operator change window
- `API_TRAFFIC_OBSERVE_MINUTES`
  - minimum post-promotion observation window
- `API_TRAFFIC_OPERATOR`
  - operator or team responsible for executing the plan
- `API_TRAFFIC_NOTES`
  - optional non-secret notes
- `API_TRAFFIC_PLAN_DIR`
  - output directory for local traffic plan artifacts

## API Data Snapshot Variables
- `API_DATA_DIR`
  - source or restore target for API data files
- `API_DATA_SNAPSHOT_DIR`
  - optional snapshot output root
- `API_DATA_SNAPSHOT_LABEL`
  - optional stable label for snapshot output
- `API_DATA_RESTORE_SOURCE`
  - snapshot directory used by restore
- `API_DATA_RESTORE_CONFIRM`
  - must be `restore` before restore runs

## Build Variables
- `IOS_BUILD_NUMBER`
  - iOS build number used by Expo config
- `ANDROID_VERSION_CODE`
  - Android version code used by Expo config

## Mobile Distribution Variables And Secrets
- `EXPO_TOKEN`
  - GitHub Environment secret used by the mobile distribution workflow to run EAS commands
- `IOS_BUILD_NUMBER`
  - increment before production iOS builds
- `ANDROID_VERSION_CODE`
  - increment before production Android builds

## Release Manifest Variables
- `EXPO_PUBLIC_APP_URL`
  - recorded in release manifests as the app URL
- `API_PUBLIC_BASE_URL`
  - recorded in release manifests as the API URL
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
  - production factory address recorded in production release manifests
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
  - staging factory address recorded in staging release manifests

## GitHub Actions Variables And Secrets
- Use GitHub Environment variables for public release metadata, package identifiers, API URLs, factory addresses, build numbers, and feature toggles.
- Use GitHub Environment secrets for RPC URLs and contract deployer credentials.
- Keep `staging` and `production` values separate through GitHub Environments instead of branching inside workflow YAML.
- The release-candidate workflow expects `EXPO_PUBLIC_API_TIMEOUT_MS` to resolve to a positive integer and defaults to `8000` when unset.
- The API image workflow publishes to GHCR through `GITHUB_TOKEN` and does not require provider deployment credentials.
- The API preflight workflow requires `API_INTERNAL_TOKEN` and target-chain RPC secrets but writes only redacted configured or missing status.
- The API traffic plan workflow uses only non-secret operator inputs and does not require hosting-provider credentials.
- The mobile distribution workflow uses `EXPO_TOKEN`; App Store Connect and Google Play credentials should stay in EAS.
- The release manifest workflow records non-secret deployment pointers only and must not include private keys, RPC URLs, or internal API tokens.

## Environment Expectations
- Development:
  - local URLs are acceptable
  - API base URL and wallet project ID can remain optional for UI work
  - analytics can be disabled or left on local-log mode while product flows are still being built
- Staging:
  - expect Base Sepolia RPC and factory address
  - require public app and API URLs
  - analytics should be enabled so funnel and degraded-state events are measurable during smoke tests
- Production:
  - expect Base mainnet RPC and factory address
  - do not use localhost URLs
  - require public HTTPS app and API URLs
  - analytics should remain enabled unless a privacy or incident response decision explicitly disables it
