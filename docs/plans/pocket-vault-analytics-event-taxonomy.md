# Pocket Vault Analytics Event Taxonomy

## Principles
- keep names typed and centralized
- emit from user intent or durable lifecycle edges
- keep payloads bounded and product-focused
- do not include freeform goal text, notes, or raw stack traces

## Event Categories
- `marketing`
  - `landing_viewed`
  - `how_it_works_viewed`
  - `security_viewed`
- `wallet`
  - `wallet_connect_started`
  - `wallet_connect_succeeded`
  - `unsupported_network_encountered`
- `vault`
  - `dashboard_viewed`
  - `create_vault_started`
  - `create_vault_step_progressed`
  - `create_vault_submitted`
  - `vault_created_confirmed`
  - `vault_detail_viewed`
- `deposit`
  - `deposit_flow_opened`
  - `deposit_approval_required`
  - `deposit_approved`
  - `deposit_confirmed`
- `withdraw`
  - `withdraw_flow_opened`
  - `withdraw_blocked_by_lock`
  - `withdraw_confirmed`
- `activity`
  - `activity_viewed`
  - `empty_state_viewed`
- `error`
  - `degraded_state_viewed`
  - `transaction_recovery_action`
- `sync`
  - `transaction_lifecycle_updated`

## Common Context
- `platform`
- `route`
- `environment`
- `deploymentTarget`
- `chainId` when connected
- `walletStatus` when relevant
- `vaultAddress` when relevant
- `txHash` when relevant
- `syncFreshness` when backend lag is part of the story

## Core Product Questions
- Are visitors reaching wallet connection from landing?
- Where do connected users abandon the create flow?
- How many created vaults get funded at least once?
- How many deposit flows stall at approval versus submission?
- How often do users attempt withdrawal before eligibility?
- Which degraded states are most visible on dashboard, activity, or vault detail?
- How often does onchain success become partial success because metadata or activity sync lags?

## Payload Discipline
- use amount buckets, not raw goal names or notes
- use unlock-date lead-time buckets where possible
- use coarse error classes such as `wallet_rejected`, `network_error`, `api_unavailable`, or `metadata_sync_delayed`
- keep recovery actions limited to `retry` and `dismiss`

## Safe Extension Rules
- add new events in the shared event map first
- keep new payloads scalar and bounded
- extend through the app analytics boundary, not direct vendor calls from components
- document the product question a new event answers before adding it
