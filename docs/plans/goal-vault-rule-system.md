# Goal Vault Rule System

## Supported Rule Types
- `timeLock`
- `cooldownUnlock`
- `guardianApproval`

## Shared Rule Language
- `VaultRuleType` identifies the rule family
- `VaultRuleSummary` carries rule-specific configuration and current state
- `WithdrawEligibility` carries connection-aware action state for the app
- `UnlockRequestStatus` carries request lifecycle state across cooldown and guardian flows
- `GuardianApprovalState` carries the guardian decision state

## Time Lock
- configured with one unlock date
- no unlock request step
- withdrawal becomes eligible automatically after the unlock date

## Cooldown Unlock
- configured with one cooldown duration
- owner must request unlock before withdrawing
- the request creates a pending cooldown window
- withdrawal becomes eligible only after the cooldown matures
- owner can cancel the request before withdrawing

## Guardian Approval
- configured with one guardian wallet
- owner must request unlock before withdrawing
- guardian must approve before withdrawal becomes eligible
- guardian can reject
- owner can retry after a rejection by requesting unlock again

## Contract Surface
- `getSummary()` remains the backward-aware summary path
- `getRuleState()` provides the richer rule-specific read model
- `requestUnlock()`, `cancelUnlockRequest()`, `approveUnlock()`, and `rejectUnlock()` cover non-time-lock rule actions

## Indexed Activity
- `vault_created`
- `deposit_confirmed`
- `withdrawal_confirmed`
- `unlock_requested`
- `unlock_canceled`
- `guardian_approved`
- `guardian_rejected`

## Frontend Behavior
- create flow chooses a rule before review and creation
- dashboard cards summarize the chosen rule
- vault detail explains the rule, current state, and next action
- guardian actions live inside the existing vault-detail flow when the guardian wallet is connected

## Compatibility Notes
- legacy time-lock vaults are still valid
- old vaults degrade to the legacy summary shape when richer rule-state methods are unavailable
- the frontend treats missing richer rule state as a compatibility case, not as a missing-vault case
