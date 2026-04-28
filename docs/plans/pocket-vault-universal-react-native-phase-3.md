# Pocket Vault Universal React Native Phase 3

## What Phase 3 Implements
- The first real end-to-end write flow in the Expo universal app.
- Wallet-aware create-vault form validation, review, transaction submission, confirmation, address resolution, metadata save, success state, and deterministic navigation.
- Shared create-vault types across `@pocket-vault/shared`, `@pocket-vault/contracts-sdk`, and `apps/mobile`.
- Session-aware vault refresh so new vaults appear in My Vaults and open in Vault Detail without brittle reloads.

## Create-Vault Flow Design
- Step 1 captures goal name, target amount, optional category, optional note, optional accent theme.
- Step 2 captures the unlock date and explains the time-lock rule in product language.
- Step 3 reviews the final vault summary and submits the real transaction.
- The app-owned state model is:
  - `idle`
  - `validating`
  - `awaiting_wallet_confirmation`
  - `submitting`
  - `confirming`
  - `confirmed`
  - `metadata_saving`
  - `success`
  - `failed`
- Screen UI never reads raw wallet SDK state directly for transaction progress.

## Contract Write Path Used
- `packages/contracts-sdk` now exports:
  - central factory address resolution by chain
  - typed `prepareCreateVaultWriteRequest`
  - `VaultCreated` event ABI
  - receipt event parsing helper
- `apps/mobile/src/lib/contracts/create-vault.ts` builds the typed review model, prepares the write request, submits `createVault(targetAmount, unlockAt)`, waits for the receipt, and hands address resolution back through a dedicated helper.
- The app only allows writes on Base and Base Sepolia.
- Factory addresses still come from runtime env config. If a factory address is missing, the create screen stays safe and disabled.
- Foundry deployment scaffolding already exists in `packages/contracts/script/Deploy.s.sol`; Phase 3 does not add new deployment scripts.

## Created Vault Address Resolution Strategy
- First try the confirmed receipt logs and parse `VaultCreated`.
- If receipt parsing does not resolve the address, fall back to `getVaultsByOwner(owner)` on the factory after confirmation.
- If possible, compare against the pre-create owner vault list and pick the new address.
- If comparison is inconclusive, use the latest owner vault as the final fallback.
- If both paths fail, keep the flow in an honest recovery state and allow retrying vault lookup without re-submitting the transaction.

## Metadata Save Sequence
- Never save metadata before onchain confirmation.
- After the vault address is resolved:
  - seed the session metadata cache immediately
  - invalidate vault queries so the new vault appears right away
  - call `POST /vaults` when `EXPO_PUBLIC_API_BASE_URL` is configured
  - treat HTTP `409` as a safe idempotent success
- If no API base URL is configured yet, metadata save resolves to local cache only so the app flow can complete without a backend rollout.

## Recovery Behavior For Partial Failures
- Wallet rejection, submission errors, confirmation errors, and validation errors stay in `failed` with safe retry.
- If onchain creation succeeds but address resolution fails:
  - show that the vault is confirmed onchain
  - keep retry focused on address lookup only
- If onchain creation succeeds but metadata save fails:
  - keep the vault visible through the session metadata cache
  - never imply the vault was not created
  - allow retrying metadata save without creating a second vault
- Query hooks merge session metadata with onchain reads so just-created vaults stay visible during RPC lag or metadata lag.

## What Remains For Later Phases
- Real backend metadata persistence and read APIs beyond the local/session fallback path.
- Indexed activity feed and backend-sourced vault metadata reads.
- Deposit flow.
- Withdraw flow.
- Allowance UX.
- Cooldown and guardian rule sets.
- Broader localization and RTL work on the write flow.

## Risks And Edge Cases
- Without an API base URL, metadata persistence is session-local only.
- If factory addresses are unset, the create screen cannot submit and must stay in the guarded config state.
- Owner-vault-list fallback can be ambiguous if the same owner creates multiple vaults in rapid succession outside this session.
- Receipt confirmation uses the configured RPC URL; missing or unstable RPC config still blocks writes.
- Metadata retry assumes backend idempotency on `contractAddress + chainId`; current client handles `409` as success but does not enforce server behavior.
