# Pocket Vault Production Smoke Runbook

## Purpose
Record protected real-world smoke evidence after candidate production activation. This runbook is operator-driven and uses small controlled USDC values. Repo automation records evidence only; it does not initiate live transactions.

## Preconditions
- Production API is reachable at HTTPS `API_PUBLIC_BASE_URL`.
- `/health` and `/ready` return successfully.
- Base mainnet wallet has only the approved smoke balance.
- Smoke wallet, operator, change window, and max USDC amount are approved.
- Support triage operator has internal token access.

## Smoke Path
1. Connect wallet on Base mainnet.
2. Create one vault with private metadata.
3. Deposit the approved small USDC amount.
4. Exercise one rule path when appropriate:
   - Time-lock: verify locked state or use an already eligible smoke vault for withdrawal.
   - Cooldown: request unlock and verify cooldown activity.
   - Guardian: request approval and verify guardian decision activity with the approved guardian wallet.
5. Withdraw only when the selected smoke vault is eligible.
6. Submit one support request from the app.
7. Verify dashboard shows the vault and amount coherently.
8. Verify vault detail shows rule state, metadata status, and activity.
9. Verify activity feed includes create, deposit, rule, and withdrawal events when applicable.
10. Verify backend indexing through `/ready` freshness and internal sync status.
11. Verify metadata reconciliation status is `metadata_complete` or clearly pending without false success.
12. Verify support request is visible in internal triage and can move to `triage`.

## Evidence To Capture
- Smoke wallet address.
- Vault address.
- Create transaction hash.
- Deposit transaction hash.
- Rule path and unlock or guardian transaction hash when applicable.
- Withdrawal transaction hash when eligible.
- Support request ID.
- Dashboard, detail, activity, indexer, metadata reconciliation, and support verification booleans.

## Command
Use the guarded workflow, or locally:

```sh
PRODUCTION_V1_SMOKE_TARGET=production \
PRODUCTION_V1_SMOKE_LABEL=<label> \
PRODUCTION_V1_SMOKE_API_BASE_URL=<https-api-url> \
PRODUCTION_V1_SMOKE_CONFIRM=smoke \
pnpm smoke:production-v1
```

Set the evidence variables listed in `docs/plans/pocket-vault-env-reference.md` before running the command.

## Stop Criteria
- Wallet connects to the wrong chain.
- Any transaction requests more than the approved small USDC amount.
- `/ready` is blocked.
- Metadata save or reconciliation is falsely reported as successful.
- Support intake fails or internal triage cannot see the request.

