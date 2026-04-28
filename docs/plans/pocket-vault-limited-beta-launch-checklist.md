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
- Beta scope approved: participant limit, value limit, support owner, incident owner, observation window, pause criteria, and re-enable criteria are recorded.

## Required Commands
- `pnpm verify:ci`
- `pnpm api:preflight`
- `pnpm api:database:runtime:plan`
- `pnpm smoke:production-v1`
- `pnpm beta:readiness`

## Launch Procedure
1. Confirm all go/no-go gates.
2. Confirm `/ready.productionActivation.safeForLimitedBetaTraffic=true`.
3. Move traffic through the approved traffic execution path.
4. Invite only the approved initial beta cohort.
5. Monitor for the approved observation window before expanding invites.
6. Review support queue after each participant wave.
7. Record launch outcome and incidents in release notes.

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

