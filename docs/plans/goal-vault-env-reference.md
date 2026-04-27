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

## API Managed Database Plan Variables
- `API_DATABASE_PLAN_TARGET`
  - `staging` or `production`
- `API_DATABASE_PLAN_LABEL`
  - stable label used in artifact naming
- `API_DATABASE_ENGINE`
  - currently `postgresql`
- `API_DATABASE_TARGET_REFERENCE`
  - non-secret managed database reference; do not use a connection string
- `API_DATABASE_SOURCE_SNAPSHOT`
  - source API data snapshot artifact name or approved storage reference
- `API_DATABASE_ROLLBACK_SNAPSHOT`
  - previous known-good snapshot artifact name or approved storage reference
- `API_DATABASE_PREFLIGHT_REPORT`
  - optional API preflight report artifact name or URL
- `API_DATABASE_TRAFFIC_PLAN`
  - optional API traffic plan artifact name or URL
- `API_DATABASE_CUTOVER_STRATEGY`
  - `cold-cutover` or `shadow-restore`
- `API_DATABASE_CHANGE_WINDOW`
  - approved operator change window
- `API_DATABASE_OBSERVE_MINUTES`
  - minimum post-cutover observation window
- `API_DATABASE_OPERATOR`
  - operator or team responsible for executing the plan
- `API_DATABASE_NOTES`
  - optional non-secret notes
- `API_DATABASE_PLAN_DIR`
  - output directory for local managed database plan artifacts

## API Managed Database Export Variables
- `API_DATABASE_EXPORT_TARGET`
  - `staging` or `production`
- `API_DATABASE_EXPORT_LABEL`
  - stable label used in export directory and artifact naming
- `API_DATABASE_EXPORT_FORMAT`
  - currently `jsonl`
- `API_DATABASE_EXPORT_SNAPSHOT_SOURCE`
  - local snapshot directory containing a snapshot `manifest.json`
- `API_DATABASE_EXPORT_DATABASE_PLAN`
  - optional managed database plan artifact name or URL
- `API_DATABASE_EXPORT_SCHEMA_MANIFEST`
  - optional managed database schema manifest artifact name or URL
- `API_DATABASE_EXPORT_PARITY_PLAN`
  - optional managed database parity plan artifact name or URL
- `API_DATABASE_EXPORT_DIR`
  - output root for local export bundle artifacts

## API Managed Database Import Plan Variables
- `API_DATABASE_IMPORT_TARGET`
  - `staging` or `production`
- `API_DATABASE_IMPORT_LABEL`
  - stable label used in import plan artifact naming
- `API_DATABASE_IMPORT_ENGINE`
  - currently `postgresql`
- `API_DATABASE_IMPORT_MODE`
  - `initial-import`, `retry-import`, or `rollback-restore`
- `API_DATABASE_IMPORT_TARGET_REFERENCE`
  - non-secret managed database target reference
- `API_DATABASE_IMPORT_SCHEMA_NAME`
  - PostgreSQL schema name used in generated import SQL
- `API_DATABASE_IMPORT_EXPORT_SOURCE`
  - local managed database export bundle directory or direct path to its `manifest.json`
- `API_DATABASE_IMPORT_DATABASE_PLAN`
  - optional managed database plan artifact name or URL
- `API_DATABASE_IMPORT_SCHEMA_MANIFEST`
  - optional managed database schema manifest artifact name or URL
- `API_DATABASE_IMPORT_PARITY_PLAN`
  - optional managed database parity plan artifact name or URL
- `API_DATABASE_IMPORT_CHANGE_WINDOW`
  - approved operator change window
- `API_DATABASE_IMPORT_OBSERVE_MINUTES`
  - minimum post-import observation window
- `API_DATABASE_IMPORT_OPERATOR`
  - operator or team responsible for import execution
- `API_DATABASE_IMPORT_NOTES`
  - optional non-secret notes
- `API_DATABASE_IMPORT_DIR`
  - output directory for local import plan artifacts

## API Managed Database Parity Variables
- `API_DATABASE_PARITY_TARGET`
  - `staging` or `production`
- `API_DATABASE_PARITY_LABEL`
  - stable label used in parity artifact naming
- `API_DATABASE_PARITY_ENGINE`
  - currently `postgresql`
- `API_DATABASE_PARITY_MODE`
  - `restore-validation`, `pre-traffic`, or `post-rollback`
- `API_DATABASE_PARITY_TARGET_REFERENCE`
  - non-secret managed database target reference
- `API_DATABASE_PARITY_SCHEMA_NAME`
  - PostgreSQL schema name used in target query generation
- `API_DATABASE_PARITY_SOURCE_SNAPSHOT`
  - API data snapshot or managed database export artifact name or approved storage reference
- `API_DATABASE_PARITY_SCHEMA_MANIFEST`
  - managed database schema manifest artifact name or URL
- `API_DATABASE_PARITY_DATABASE_PLAN`
  - optional managed database plan artifact name or URL
- `API_DATABASE_PARITY_SCHEMA_SQL`
  - optional managed database SQL artifact name or URL
- `API_DATABASE_PARITY_TRAFFIC_PLAN`
  - optional API traffic plan artifact name or URL
- `API_DATABASE_PARITY_OBSERVE_MINUTES`
  - minimum post-parity observation window
- `API_DATABASE_PARITY_OPERATOR`
  - operator or team responsible for executing parity review
- `API_DATABASE_PARITY_NOTES`
  - optional non-secret notes
- `API_DATABASE_PARITY_DIR`
  - output directory for local parity plan artifacts

## API Managed Database Schema Variables
- `API_DATABASE_SCHEMA_TARGET`
  - `staging` or `production`
- `API_DATABASE_SCHEMA_LABEL`
  - stable label used in SQL and manifest artifact naming
- `API_DATABASE_SCHEMA_ENGINE`
  - currently `postgresql`
- `API_DATABASE_SCHEMA_NAME`
  - lowercase PostgreSQL schema identifier; defaults to `goal_vault_api`
- `API_DATABASE_SCHEMA_SOURCE_PLAN`
  - optional managed database plan artifact name or URL
- `API_DATABASE_SCHEMA_DIR`
  - output directory for local schema artifacts

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
- The API managed database plan workflow uses only non-secret operator inputs and rejects target references that look like connection strings or credentials.
- The API managed database export workflow reads a snapshot directory, verifies snapshot checksums, and writes JSONL files only; export bundles are sensitive and should not be committed.
- The API managed database import plan workflow reads an export bundle, verifies JSONL checksums and row counts, and writes psql-compatible SQL only; it does not connect to or mutate a database.
- The API managed database parity workflow emits query pairs and acceptance gates only; it does not connect to SQLite or PostgreSQL.
- The API managed database schema workflow emits SQL and JSON artifacts only; it does not connect to or mutate a database.
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
