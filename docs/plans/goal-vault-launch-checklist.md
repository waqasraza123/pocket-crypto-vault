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

## Backend
- Start the API with launch env values.
- Check `GET /health` for service liveness.
- Check `GET /ready` for blocked or degraded checks.
- Confirm `API_PUBLIC_BASE_URL` matches the public deployment URL.
- Confirm indexer mode and sync interval are appropriate for the target environment.

## CI And Release Candidate
- Confirm the GitHub Environment exists for the target release.
- Confirm production requires environment reviewer approval.
- Confirm required GitHub Environment variables and secrets match `docs/plans/goal-vault-ci-release-workflows.md`.
- Run the `Release Candidate` workflow for `staging` or `production`.
- Confirm the workflow typechecks, checks API readiness when configured, and uploads the expected export artifacts.

## Web
- Run `pnpm verify:mobile:web`.
- Open the exported web build and confirm route titles, landing copy, and app-shell packaging look correct.
- Confirm the deployed web build points to the correct API base URL.

## Mobile
- Confirm `apps/mobile/app.config.js` resolves the expected environment-specific package identity.
- Confirm `eas.json` profile matches the intended target.
- Run `pnpm verify:mobile:ios`.
- If building Android externally, confirm package name and version code assumptions before release.

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
- If indexer background sync is disabled, do not claim indexed activity freshness until manual sync procedures are in place.
