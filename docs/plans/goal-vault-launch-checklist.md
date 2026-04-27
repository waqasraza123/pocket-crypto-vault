# Goal Vault Launch Checklist

## Environment
- Confirm `APP_ENV` and `EXPO_PUBLIC_APP_ENV` are set and match.
- Confirm `EXPO_PUBLIC_APP_URL` is set correctly for staging or production.
- Confirm `EXPO_PUBLIC_API_BASE_URL` points to the deployed API.
- Confirm `EXPO_PUBLIC_REOWN_PROJECT_ID` is set for wallet flows.
- Confirm `EXPO_PUBLIC_WALLETCONNECT_METADATA_URL` resolves to the public app URL or another valid HTTPS page.

## Chain Config
- Confirm Base RPC and factory address are set for production.
- Confirm Base Sepolia RPC and factory address are set for staging.
- Confirm the expected launch chain has both reads and writes configured.

## Contract Deployment
- Confirm `USDC_ADDRESS`, `CONTRACT_DEPLOY_RPC_URL`, and `CONTRACT_DEPLOYER_PRIVATE_KEY` are set on the target GitHub Environment.
- Run the `Contract Deployment` workflow in `simulate` mode before any broadcast.
- Broadcast only after reviewing the target chain ID and setting `confirm_broadcast` to `deploy`.
- Download the deployment manifest artifact after broadcast.
- Copy the deployed factory address into the matching app/API environment variables.

## Backend
- Start the API with launch env values.
- Check `GET /health` for service liveness.
- Check `GET /ready` for blocked or degraded checks.
- Confirm `API_PUBLIC_BASE_URL` matches the public deployment URL.
- Confirm indexer mode and sync interval are appropriate for the target environment.
- Confirm container hosting uses `API_HOST=0.0.0.0`.
- Confirm `API_DATA_DIR` points to durable mounted storage before relying on indexed history.

## CI And Release Candidate
- Confirm the GitHub Environment exists for the target release.
- Confirm production requires environment reviewer approval.
- Confirm required GitHub Environment variables and secrets match `docs/plans/goal-vault-ci-release-workflows.md`.
- Run the `Release Candidate` workflow for `staging` or `production`.
- Confirm the workflow typechecks, checks API readiness when configured, and uploads the expected export artifacts.

## API Image
- Run the `API Image` workflow in `build` mode first.
- Publish only after release-candidate review by setting `mode` to `publish` and `confirm_publish` to `publish`.
- Download the API image manifest artifact.
- Deploy the published image manually to the selected backend host.
- Check `/health` and `/ready` after host deployment.

## Web
- Run `pnpm verify:mobile:web`.
- Open the exported web build and confirm route titles, landing copy, and app-shell packaging look correct.
- Confirm the deployed web build points to the correct API base URL.

## Mobile
- Confirm `apps/mobile/app.config.js` resolves the expected environment-specific package identity.
- Confirm `apps/mobile/eas.json` profile matches the intended target.
- Run `pnpm verify:mobile:ios`.
- If building Android externally, confirm package name and version code assumptions before release.

## Mobile Distribution
- Confirm `EXPO_TOKEN` is set on the target GitHub Environment.
- Confirm `IOS_BUILD_NUMBER` and `ANDROID_VERSION_CODE` are incremented before production builds.
- Run the `Mobile Distribution` workflow in `build` mode first.
- Use `submit` mode only for production and only with `confirm_submit` set to `submit`.
- Confirm store metadata, privacy details, screenshots, and support URLs are ready before submission.

## Product Smoke Checks
- Connect wallet on the supported target network.
- Create one vault.
- Deposit USDC into the new vault.
- Verify dashboard, vault detail, and activity update coherently.
- Verify withdraw behavior using an eligible staging-safe vault or an already unlockable vault.
- Confirm metadata reconciliation notices remain calm and honest if syncing lags.

## Post-Deploy Checks
- Confirm `/ready` stays usable after deployment.
- Confirm activity indexing catches up after create, deposit, and withdraw.
- Confirm wallet connection and unsupported-network handling still render safely.
- Confirm the landing page and app shell still feel aligned in the deployed browser.

## Trust Review
- Confirm app-store and web-facing naming is consistently "Goal Vault".
- Confirm no hypey or technical failure copy leaked into user-facing surfaces.
- Confirm unlock-date language still reads clearly on create, detail, and withdraw surfaces.

## Rollback / Disable
- If the API is unhealthy, disable public launch traffic or point the app back to a known-good API base URL.
- If an API image is unhealthy, redeploy the previous known-good image tag.
- If indexer background sync is disabled, do not claim indexed activity freshness until manual sync procedures are in place.
- If a new factory deployment is wrong, restore the previous factory address in app/API configuration and stop promotion.
- If a mobile build is wrong, stop store rollout and submit a fixed build through EAS.
