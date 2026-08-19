# Pocket Vault Launch Checklist

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
- Run the `API Preflight` workflow for the target environment before deploying or promoting the backend image.
- Download the API preflight report artifact and resolve any validation errors.
- Start the API with launch env values.
- Check `GET /health` for service liveness.
- Check `GET /ready` for blocked or degraded checks.
- Confirm `API_PUBLIC_BASE_URL` matches the public deployment URL.
- Confirm indexer mode and sync interval are appropriate for the target environment.
- Confirm container hosting uses `API_HOST=0.0.0.0`.
- Confirm `API_PERSISTENCE_DRIVER=sqlite`, or confirm PostgreSQL preflight passes connection and schema checks before any managed database cutover.
- Confirm `API_POSTGRES_DRIVER=neon` only when production PostgreSQL runtime should use Neon, and keep `API_DATABASE_URL` in secret storage.
- Confirm `API_DATABASE_URL` is treated as active runtime storage only when PostgreSQL mode is selected and the managed database runtime plan is accepted.
- Confirm `API_ENABLE_SUPPORT=true` for beta environments, or record the alternate support channel in the beta readiness plan.
- Confirm operators can access `/internal/support/requests` with `API_INTERNAL_TOKEN` before inviting beta users.
- Confirm `API_DATA_DIR` points to durable mounted storage before relying on indexed history.
- Create an API data snapshot before manual backend traffic movement.
- Store API data snapshots only in approved operational storage.

## Limited Beta Gate
- Generate a beta readiness plan before inviting real users.
- Confirm release manifest, API preflight, API traffic plan, persistence runtime plan when applicable, source snapshot, and rollback snapshot references are present.
- Confirm participant limit, maximum recommended USDC per vault, support reference, and incident owner are recorded.
- Confirm `/support` accepts structured support requests when it is the recorded support reference.
- Confirm at least one operator can move a support request from `open` to `triage` and `closed` through the internal API.
- Confirm beta support exports can be generated from an API data snapshot when offline review is needed.
- Confirm `/ready.productionActivation.safeForLimitedBetaTraffic=true` before inviting production beta users.
- Generate the production activation record after traffic execution, protected smoke, beta readiness, and snapshot evidence are accepted.
- Generate a stable production observation report after activation and before expanding beta invitations.
- Generate a beta invitation wave plan before each cohort invite and keep participant PII outside artifacts.
- Generate a beta wave outcome report after each wave observation window before approving the next wave.
- Generate a beta expansion decision report before any larger invitation wave.
- Generate a beta graduation decision report before public launch planning.
- Confirm rollback steps are reviewed with the operator before sending invitations.
- Treat beta limits as operational guidance, not protocol-enforced limits.

## Beta Support Export
- Create an API data snapshot before exporting support rows.
- Run the `Beta Support Export` workflow in `summary` mode for routine beta review.
- Use `private` mode only with explicit confirmation when full request text or contact details are needed.
- Confirm the manifest says `commitAllowed: false`, `noLiveDatabaseConnected: true`, and `noSupportStatusMutated: true`.
- Store support exports only in approved operational storage and delete them after the review window.
- Update support request status through the internal support triage API after offline review.

## Beta Data Retention
- Run the `Beta Data Retention Plan` workflow before inviting a broader beta cohort.
- Provide policy, support, and incident owners.
- Provide API data snapshot and beta support export references.
- Confirm the plan covers support requests, support exports, analytics events, API snapshots, managed database exports, release artifacts, runtime logs, and incident records.
- Confirm the plan says `commitAllowed: false`, `noLiveDataRead: true`, `noDataDeleted: true`, and `noRetentionPolicyApplied: true`.
- Review deletion request and legal-hold handling with the operator before expanding beta access.

## Managed Database Planning
- Run the `API Managed Database Plan` workflow before provisioning or migrating external database infrastructure.
- Use a non-secret target reference, not a database connection string.
- Include source and rollback API data snapshot references.
- Review the schema inventory and private data classification before any provider-specific migration work.
- Confirm the plan says `noDatabaseMutated: true` before treating it as a review artifact.
- Run the `API Managed Database Schema` workflow after the managed database plan.
- Review the generated PostgreSQL SQL and JSON manifest before any provider-specific DDL application.
- Confirm the schema manifest says `noDatabaseMutated: true` before treating it as a review artifact.
- Run the `API Managed Database Schema Apply` workflow only after approval, with `confirm_apply=apply`.
- Store the schema apply result artifact with release evidence.
- Run the `API Managed Database Export` workflow after the source snapshot and schema bundle are reviewed.
- Confirm the export manifest row counts, checksums, and data classification before any provider-owned import.
- Confirm the export manifest says `noDatabaseConnected: true` and `noDataImported: true` before treating it as a handoff artifact.
- Run the `API Managed Database Import Plan` workflow after export bundle review.
- Confirm the import plan verifies export file checksums and row counts before provider-owned execution.
- Confirm the import plan says `noDatabaseConnected: true` and `noDataImported: true` before treating it as a handoff artifact.
- Run the `API Managed Database Import Execute` workflow only after approval, with `confirm_execute=import`.
- Store the import execution result artifact with release evidence.
- Run the `API Managed Database Parity` workflow after restore into a managed database target and before traffic movement.
- Run the emitted parity query pairs through approved operational access or the `API Managed Database Parity Execute` workflow with `confirm_execute=compare`.
- Store the parity execution result artifact with release evidence.
- Confirm the parity plan says `noDatabaseConnected: true` and `noDataCompared: true` before treating it as a review artifact.

## CI And Release Candidate
- Confirm the GitHub Environment exists for the target release.
- Confirm production requires environment reviewer approval.
- Confirm required GitHub Environment variables and secrets match `docs/plans/pocket-vault-ci-release-workflows.md`.
- Run the `Release Candidate` workflow for `staging` or `production`.
- Confirm the workflow typechecks, checks API readiness when configured, and uploads the expected export artifacts.

## API Image
- Confirm API preflight passes for the target environment.
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

## Release Manifest
- Attach or reference the passing API preflight report when preparing release notes.
- Run the `Release Manifest` workflow before manual traffic movement.
- Confirm the manifest records the intended API image tag.
- Confirm the manifest records the intended factory address.
- Add rollback API image and previous factory address when applicable.
- Store the manifest artifact with release notes.

## API Traffic Plan
- Run the `API Traffic Plan` workflow before manual API traffic movement.
- For promotion, include candidate URL, rollback URL, candidate image, rollback image, release manifest, API preflight report, and API data snapshot references.
- Download the API traffic plan artifact and review it with the hosting-provider operator.
- Confirm the plan says `noTrafficMoved: true` before treating it as a review artifact.

## Vercel API Traffic Command
- Run the `Vercel API Traffic Command` workflow after the API traffic plan when Vercel owns the API host.
- Provide the reviewed traffic plan reference, Vercel project reference, production API domain, and deployment URLs required by the selected action.
- Download the command plan artifact and confirm it says `noDeploymentPerformed: true` and `noTrafficMoved: true`.
- Confirm the artifact names only required Vercel secret names and does not include secret values.
- Execute any generated `vercel promote`, `vercel rollback`, or `vercel alias rm` command only through `Vercel API Traffic Execute` with `confirm_execute=execute` or another approved operator environment.
- Store the Vercel traffic execution result artifact with release evidence.

## Product Smoke Checks
- Run the `Production V1 Smoke` workflow with `confirm_smoke=smoke` after API traffic movement.
- Connect wallet on the supported target network.
- Create one vault.
- Deposit USDC into the new vault.
- Exercise a rule-specific unlock path when the smoke vault and launch window allow it.
- Verify dashboard, vault detail, and activity update coherently.
- Verify backend indexing and metadata reconciliation.
- Verify withdraw behavior using an eligible staging-safe vault or an already unlockable vault.
- Submit one support intake request and confirm internal triage visibility.
- Record smoke wallet, vault, create transaction, deposit transaction, rule path, unlock or guardian transaction when applicable, withdraw transaction when eligible, support request, dashboard, detail, activity, indexer, metadata, and support verification evidence in the smoke artifact.
- Confirm metadata reconciliation notices remain calm and honest if syncing lags.

## Production Activation Record
- Run the `Production Activation Record` workflow after API traffic execution and protected smoke pass.
- Provide release manifest, API preflight, managed database runtime plan, schema execution, import execution, parity execution, traffic plan, traffic execution, smoke result, beta readiness, source snapshot, rollback snapshot, support reference, and incident owner.
- Use `activation_outcome=accepted` only when the activation remains live and accepted.
- Use `activation_outcome=rolled-back` or `disabled` when the cutover ended in recovery mode.
- Confirm the artifact says `noDeploymentPerformed: true`, `noDatabaseMutated: true`, and `noTrafficMoved: true`.
- Store the activation record with release evidence before expanding beta invitations.

## Production Observation Report
- Run the `Production Observation Report` workflow after the activation record is accepted and before each beta invitation wave expands.
- Provide the accepted activation record, public API URL, support reference, incident owner, observation window, indexer status, support status, analytics status, error budget status, support request count, failed transaction count, and incident count.
- Use `observation_status=stable` only when public `/health`, public `/ready`, indexer, support, analytics, error budget, and incident signals are accepted.
- Use `observation_status=degraded` or `incident` when invitation expansion should pause.
- Confirm the artifact says `noDeploymentPerformed: true`, `noDatabaseMutated: true`, `noTrafficMoved: true`, `noChainTransactionSent: true`, and `noUserInvitesSent: true`.
- Store the observation report with activation evidence.

## Beta Invitation Wave
- Run the `Beta Invitation Wave Plan` workflow after beta readiness and a stable production observation report.
- Provide readiness, observation, wave number, wave size, previously invited count, max vault USDC guidance, communication reference, support reference, incident owner, and invite owner.
- Confirm the wave size plus previously invited count stays within the approved participant limit.
- Confirm the artifact says `noInvitesSent: true`.
- Confirm no participant names, emails, wallet addresses, social handles, invite links, or contact details are recorded.
- Send invitations only from the approved private operational system after reviewing the wave plan.

## Beta Wave Outcome
- Run the `Beta Wave Outcome Report` workflow after each invitation wave observation window.
- Provide the invitation wave plan, post-wave observation report, decision, aggregate invited count, activated wallet count, vault count, deposit count, withdraw count, support request count, failed transaction count, incident count, support reference, and incident owner.
- Use `decision=continue` only when the post-wave observation is stable and incident count is zero.
- Use `decision=pause`, `rollback`, or `disable` when support, transaction, readiness, incident, or error-budget signals require review or recovery.
- Confirm `participant_identifiers_recorded=false`.
- Confirm no participant names, emails, wallet addresses, social handles, invite links, contact details, private support text, or participant-level transaction traces are recorded.
- Approve the next invitation wave only after a `continue` outcome report.

## Beta Expansion Decision
- Run the `Beta Expansion Decision Report` workflow before a larger invitation wave.
- Provide latest wave outcome, retention plan, current participant count, proposed next wave size, participant limit, open support count, unresolved incident count, failed transaction count, support backlog status, operator capacity, retention review, support review, privacy review, support reference, incident owner, and expansion owner.
- Use `decision=expand` only when the latest wave outcome is `continue`, support is clear, capacity is ready, reviews are accepted, and aggregate blockers are zero.
- Use `decision=hold`, `rollback`, or `disable` when review, support, incident, transaction, retention, or capacity gates are not accepted.
- Confirm `participant_identifiers_recorded=false`.
- Confirm no participant names, emails, wallet addresses, social handles, invite links, contact details, private support text, or participant-level transaction traces are recorded.
- Generate the next observation report and invitation wave plan only after an `expand` decision.

## Beta Graduation Decision
- Run the `Beta Graduation Decision Report` workflow before public launch planning.
- Provide expansion decision, latest wave outcome, retention plan, participant count, minimum participant sample, open support count, unresolved incident count, failed transaction count, support readiness, privacy readiness, reliability readiness, communications readiness, store readiness, review approvals, support reference, incident owner, and graduation owner.
- Use `decision=graduate` only when expanded beta evidence is clean, review gates are accepted, and readiness statuses are `ready`.
- Use `decision=extend-beta`, `hold`, `rollback`, or `disable` when more beta evidence, review work, or recovery action is needed.
- Confirm `participant_identifiers_recorded=false`.
- Confirm no participant names, emails, wallet addresses, social handles, invite links, contact details, private support text, or participant-level transaction traces are recorded.
- Start public launch planning only after a `graduate` decision.

## Post-Deploy Checks
- Confirm `/ready` stays usable after deployment.
- Confirm activity indexing catches up after create, deposit, and withdraw.
- Confirm wallet connection and unsupported-network handling still render safely.
- Confirm the landing page and app shell still feel aligned in the deployed browser.

## Trust Review
- Confirm app-store and web-facing naming is consistently "Pocket Vault".
- Confirm no hypey or technical failure copy leaked into user-facing surfaces.
- Confirm unlock-date language still reads clearly on create, detail, and withdraw surfaces.

## Rollback / Disable
- If the API is unhealthy, disable public launch traffic or point the app back to a known-good API base URL.
- If an API image is unhealthy, redeploy the previous known-good image tag.
- Generate an `API Traffic Plan` rollback or disable plan before manual provider changes when time allows.
- Generate a `Vercel API Traffic Command` rollback or disable plan before running Vercel rollback or alias removal when the API host is Vercel and time allows.
- For Vercel disablement, use `VERCEL_API_DISABLE_STRATEGY=remove-alias` and confirm the execution artifact records `publicTrafficDisabled: true`.
- Restore API data from the intended snapshot only with the API stopped.
- If indexer background sync is disabled, do not claim indexed activity freshness until manual sync procedures are in place.
- If a new factory deployment is wrong, restore the previous factory address in app/API configuration and stop promotion.
- If a mobile build is wrong, stop store rollout and submit a fixed build through EAS.
- Use the release manifest rollback pointers when restoring API image or factory configuration.
