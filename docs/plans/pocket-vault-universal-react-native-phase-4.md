# Pocket Vault Universal React Native Phase 4

## 1. What Phase 4 Implements
- Real USDC deposit flow in the universal Expo app for Base and Base Sepolia.
- Wallet-aware USDC balance and allowance reads for the connected account and selected vault.
- Two-step approval plus deposit flow when allowance is insufficient.
- Receipt-confirmed deposit success handling with vault detail, vault list, and activity refresh.
- Session-backed deposit activity bridge until indexed backend activity lands later.

## 2. USDC Balance and Allowance Strategy
- `packages/contracts-sdk/src/read/erc20.ts` reads `balanceOf`, `allowance`, `decimals`, and `symbol`.
- `apps/mobile/src/lib/contracts/erc20-reads.ts` maps those reads into app-owned `TokenBalanceState` and `AllowanceState`.
- `apps/mobile/src/hooks/useUsdcBalance.ts` and `apps/mobile/src/hooks/useUsdcAllowance.ts` keep token reads out of screens.
- USDC address resolution stays centralized through chain config and `getUsdcAddress`.

## 3. Approval + Deposit Flow Design
- `apps/mobile/src/hooks/useVaultDepositFlow.ts` owns the app-specific deposit flow state.
- Status model: `idle`, `invalid`, `ready_for_approval`, `approving`, `approval_confirming`, `ready_for_deposit`, `depositing`, `deposit_confirming`, `success`, `failed`.
- Approval uses ERC20 `approve(vault, amount)`.
- Deposit uses `GoalVault.deposit(amount)`.
- Approval success does not imply deposit success.
- If approval confirms and deposit later fails, the flow keeps approval-complete state so deposit can retry without forcing another approval.

## 4. Amount Handling Decisions
- User input is normalized centrally through shared amount helpers and token mappers.
- Deposit parsing uses `parseUnits` with live token decimals.
- Validation blocks zero, malformed input, excess decimal precision, and amounts above wallet balance.
- Deposit preview uses atomic values for calculations, then formats into human-readable USDC.

## 5. Vault Refresh Strategy After Deposit
- After confirmed deposit receipt:
  - session activity is written
  - `invalidateVaultQueries()` bumps the local store version
  - `useVaultDetail`, `useVaults`, and `useVaultActivity` re-read through their existing effects
- Balance and allowance hooks also refetch after approval and deposit transitions.

## 6. Activity Update Strategy
- `parseVaultDepositEvent` reads the confirmed deposit event from the receipt when possible.
- The app writes a confirmed session activity event immediately after receipt confirmation.
- Vault detail preview and the Activity route merge session events with fallback data.
- This keeps state honest while backend indexing remains deferred.

## 7. Error / Recovery Behavior
- Disconnected wallet, unsupported network, missing RPC, asset mismatch, invalid amount, and insufficient balance all block action before write submission.
- Wallet rejection produces direct user-facing copy for approval and deposit separately.
- Approval failure does not claim deposit progress.
- Deposit failure after approval preserves approval-complete state for safe retry.
- Unmounts do not keep writing state into detached components.

## 8. What Remains for Later Phases
- Withdraw write flow and unlock-specific UX.
- Backend persistence for indexed activity and richer metadata recovery.
- Server-driven activity history beyond session-confirmed deposits.
- Arabic and RTL rollout across the write flows.

## 9. Risks and Edge Cases
- Session activity is only a local bridge and does not replace indexed history.
- Export still emits upstream package warnings from wallet and crypto dependencies during Expo bundling.
- Approval reads depend on available RPC configuration for Base or Base Sepolia.
- Vaults with unexpected non-USDC assets are blocked from deposit flow rather than guessed through.
