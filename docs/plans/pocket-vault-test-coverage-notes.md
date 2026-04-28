# Pocket Vault Test Coverage Notes

## Coverage Added In Phase 16

### Contracts
- `packages/contracts/test/GoalVault.t.sol`
- Covers time-lock, cooldown unlock, guardian approval, deposit or withdraw accounting, emitted creation events, and invalid action rejection paths.

### Backend
- `apps/api/src/modules/indexer/factory-sync.service.test.ts`
- `apps/api/src/modules/vaults/metadata-security.test.ts`
- `apps/api/src/modules/vaults/vaults.serializers.test.ts`
- `apps/api/src/app.test.ts`

Covered backend behaviors:
- legacy and V2 factory creation normalization
- cooldown and guardian creation persistence
- idempotent event reprocessing
- signed metadata verification against tx sender, receipt logs, and onchain summary
- internal route protection
- metadata route validation failures
- rule-aware serializer output and unlock lifecycle activity serialization

### Frontend and Shared Logic
- `apps/mobile/src/lib/contracts/unlock-flow.test.ts`
- `apps/mobile/src/lib/data/rule-overrides.test.ts`
- `packages/contracts-sdk/src/mappers/vault-mappers.test.ts`
- `packages/api-client/src/mappers.test.ts`

Covered frontend and shared behaviors:
- unlock lifecycle local activity mapping
- cooldown request and cancel local state projection
- guardian approve and reject local state projection
- rule-aware SDK mapping
- rule-aware API-client parsing

## What This Coverage Intentionally Prioritizes
- audited correctness gaps over shallow snapshot tests
- deterministic business logic over UI rendering trivia
- rule-state transitions over cosmetic screen behavior
- security and source-of-truth boundaries over generic route smoke tests

## Coverage Still Not Comprehensive
- full hook-level mocking for every create, deposit, withdraw, and unlock hook branch
- browser or device automation for Expo surfaces
- database migration tests because the backend currently uses direct SQLite bootstrap rather than a migration system
- CI-level workflow checks because CI is still outside current repo scope

## Recommended Future Additions
- deeper hook tests for `useCreateVaultMutation`, `useVaultDepositFlow`, `useVaultWithdrawFlow`, and `useVaultUnlockFlow`
- API integration tests around late metadata arrival and readiness degradation summaries
- export or smoke validation in CI once repository CI is added
