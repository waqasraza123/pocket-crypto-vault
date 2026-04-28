# Pocket Vault Universal React Native Phase 15

## What Phase 15 Implements
- cooldown unlock vaults across contract, SDK, backend, API, and app layers
- guardian approval vaults across contract, SDK, backend, API, and app layers
- one generalized rule model shared across onchain reads, serializer output, API parsing, and frontend view models
- rule-aware create flow, vault detail state, activity normalization, and post-action refresh behavior

## Rule Model Strategy
- keep one `VaultRuleType` union: `timeLock`, `cooldownUnlock`, `guardianApproval`
- keep one `VaultRuleSummary` union so the frontend does not guess from raw fields
- keep one `WithdrawEligibility` shape that expresses next actions, request status, guardian state, and withdrawal eligibility
- keep old time-lock reads supported by preserving the legacy summary surface while adding richer rule-state reads for new vaults

## Contract and Version Strategy
- `GoalVault` now stores rule configuration plus unlock-request and guardian-decision state
- the legacy `getSummary()` surface stays available for backward-aware reads
- new rule-specific reads come from `getRuleState()`
- `GoalVaultFactory` now supports richer creation through the generalized create path
- new deployments emit `VaultCreatedV2`
- time-lock deployments still emit the legacy `VaultCreated` event so older assumptions remain readable

## Cooldown Flow Design
- owner creates a cooldown vault with a configured duration
- owner funds normally
- owner requests unlock when ready
- vault enters pending cooldown state
- withdrawal becomes eligible after the cooldown matures
- owner can cancel the unlock request before withdrawing

## Guardian Approval Flow Design
- owner creates a guardian vault with one guardian wallet
- owner requests unlock when ready
- guardian connects in the same app and acts from vault detail when viewing that vault
- guardian can approve or reject the request
- owner can withdraw only after approval
- owner can retry after rejection by submitting a new unlock request

## Backend and API Changes
- persisted vault records now store rule type, cooldown duration, guardian address, unlock request state, and guardian decision state
- indexer normalizes unlock-request and guardian-decision events
- vault summary, detail, and activity serializers expose explicit rule summaries and lifecycle state
- activity now supports `unlock_requested`, `unlock_canceled`, `guardian_approved`, and `guardian_rejected`

## Source-of-Truth Decisions
- chain remains authoritative for balances, ownership, withdrawal eligibility, and lifecycle confirmation
- backend remains the primary enriched source for metadata, normalized activity, dashboard summaries, and detail-page rule state
- session overlays remain limited to short-lived transaction or recovery bridging

## Backward Compatibility Decisions
- legacy time-lock vaults are still treated as valid goal vaults
- reads fall back to the old summary shape when richer rule-state methods are not available
- the app only treats missing richer rule state as a reason to degrade to time-lock assumptions, not as a reason to hide a vault

## What Remains After This Phase
- infrastructure work beyond the original rule system, such as database persistence and CI or release automation
- operational tuning based on real post-launch behavior

## Risks and Edge Cases
- legacy and new factory events must not create duplicate `vault_created` activity
- guardian actions require the correct wallet to be connected in the same app surface
- old persisted vault snapshots may temporarily lack new fields until resynced
- cooldown and guardian state can still appear slightly stale while indexing catches up after confirmation
