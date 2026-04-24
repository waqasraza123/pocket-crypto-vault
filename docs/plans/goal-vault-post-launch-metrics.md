# Goal Vault Post-Launch Metrics

## Funnel Metrics
- `visitor_to_wallet_connected`
  - source events: `landing_viewed`, `wallet_connect_succeeded`
  - question: does the landing page move visitors into the product?
- `wallet_connected_to_create_started`
  - source events: `wallet_connect_succeeded`, `create_vault_started`
  - question: do connected users understand the first meaningful action?
- `create_started_to_confirmed`
  - source events: `create_vault_started`, `vault_created_confirmed`
  - question: where does first-vault creation fail or stall?
- `vault_created_to_first_deposit`
  - source events: `vault_created_confirmed`, `deposit_confirmed`
  - question: do newly created vaults get funded?
- `first_deposit_to_repeat_deposit`
  - source events: `deposit_confirmed`
  - question: does the product create repeat saving behavior?
- `withdraw_attempted_to_withdraw_confirmed`
  - source events: `withdraw_flow_opened`, `withdraw_blocked_by_lock`, `withdraw_confirmed`
  - question: are users understanding eligibility and completing withdrawals when allowed?

## Product Health Signals
- vaults created per connected user
- users with at least one confirmed deposit
- repeat deposits per vault
- vaults with no deposit after creation
- locked withdraw attempts as a share of withdraw opens
- eligible withdrawals completed
- dashboard and vault-detail return visits

## Reliability Signals
- degraded-state exposure by surface
- unsupported-network exposure rate
- wallet disconnects during create, deposit, or withdraw
- transaction lifecycle failures by flow
- partial-success rate after onchain confirmation
- activity or metadata sync lag visibility

## Operational Signals
- analytics ingestion success and failure counts
- vault list and vault detail API read success rate
- activity feed API read success rate
- factory sync completion and failure counts
- vault sync batch completion and failure counts
- metadata reconciliation update counts

## What Is Intentionally Not Collected
- goal names
- vault notes
- wallet personal profile information
- raw stack traces inside analytics payloads
- full freeform error messages unless they stay in operator logs only
