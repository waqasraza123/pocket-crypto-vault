# Pocket Vault Limited Beta Launch Checklist

## Scope
- Invite only the approved participant count.
- Keep per-vault USDC guidance low and explicit.
- Do not market as a public launch.
- Do not introduce new features, chains, assets, yield, swaps, or social mechanics.

## Go/No-Go Gates
- Code ready: CI, typecheck, and API tests pass.
- Database ready: production uses PostgreSQL and parity is accepted.
- Config ready: production Base RPC, factory, API URL, internal token, support, analytics, and wallet config are present.
- Smoke ready: protected smoke artifact includes create, deposit, support, dashboard, detail, activity, indexer, and metadata verification.
- Support ready: internal triage can list, read, and update support requests.
- Analytics ready: analytics persistence is enabled or an approved alternate monitoring path is recorded.
- Rollback ready: rollback URL, image, snapshot, and traffic reversal path are accepted.
- Operator evidence captured: release manifest, preflight, runtime plan, traffic plan, smoke result, snapshots, and beta readiness artifacts are stored.
- Activation recorded: post-cutover activation record is accepted or the recovery outcome is recorded.
- Observation clean: stable production observation report is stored for the current invitation wave.
- Invitation wave approved: beta invitation wave plan is stored and contains no participant PII.
- Prior wave outcome accepted: previous wave outcome report is `continue` before any expansion.
- Expansion accepted: beta expansion decision report is `expand` before any larger wave.
- Graduation accepted: beta graduation decision report is `graduate` before public launch planning.
- Beta scope approved: participant limit, value limit, support owner, incident owner, observation window, pause criteria, and re-enable criteria are recorded.

## Required Commands
- `pnpm verify:ci`
- `pnpm api:preflight`
- `pnpm api:database:runtime:plan`
- `pnpm smoke:production-v1`
- `pnpm beta:readiness`
- `pnpm production:activation:record`
- `pnpm production:observation:report`
- `pnpm beta:invitation:wave`
- `pnpm beta:wave:outcome`
- `pnpm beta:expansion:decision`
- `pnpm beta:graduation:decision`

## Launch Procedure
1. Confirm all go/no-go gates.
2. Confirm `/ready.productionActivation.safeForLimitedBetaTraffic=true`.
3. Move traffic through the approved traffic execution path.
4. Run the production activation record and store it with release evidence.
5. Run a stable production observation report and store it with release evidence.
6. Run a beta invitation wave plan for the initial cohort.
7. Invite only the approved initial beta cohort from the private operational system.
8. Monitor for the approved observation window before expanding invites.
9. Run a beta wave outcome report before deciding on expansion.
10. Run a beta expansion decision report before any larger wave.
11. Run a beta graduation decision report before public launch planning.
12. Run another observation report and invitation wave plan before each invitation expansion when the decision remains beta-only.
13. Review support queue after each participant wave.
14. Record launch outcome and incidents in release notes.

## Monitoring Priorities
- `/health` alive.
- `/ready` ready.
- PostgreSQL persistence selected.
- Indexer freshness and errors.
- Metadata reconciliation lag.
- Support request volume and category.
- Failed create, deposit, unlock, or withdraw attempts.
- Analytics ingestion errors.
- Wallet/network misconfiguration reports.

## Pause Criteria
- Any loss or incorrect display of real user funds.
- Repeated failed deposits or withdrawals.
- Indexer remains lagging beyond the approved observation window.
- Support cannot triage urgent requests.
- PostgreSQL errors affect indexed reads or support persistence.
- Public API rollback path is unavailable.
