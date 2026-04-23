# Goal Vault Universal React Native Phase 5

## What Phase 5 Implements
- Real time-lock withdrawal flow in the universal Expo app.
- Owner-aware withdrawal eligibility and locked-vs-ready UI.
- Countdown-driven unlock updates during an active session.
- Deliberate withdrawal confirmation before wallet submission.
- Confirmed withdrawal activity bridged into session state before full backend indexing.

## Withdrawal Eligibility Strategy
- Eligibility is app-owned and derived from vault unlock time, current balance, connected wallet, and active chain.
- `useWithdrawEligibility` recalculates on wallet changes and while the unlock countdown is active.
- Availability distinguishes locked, ready, empty, owner-only, disconnected, unsupported-network, and unavailable states.
- Screens consume the eligibility model instead of raw wallet or contract state.

## Countdown / Timing Strategy
- `time-lock-utils.ts` centralizes unlock timestamp parsing and countdown math.
- Countdown refreshes on an interval while the vault is still locked, then naturally flips to unlocked without route refresh.
- Exact unlock date/time and compact relative countdown are rendered from shared helpers.

## Withdraw UX Design
- Withdrawal stays visually and verbally more serious than deposit.
- Locked state shows exact unlock timing, countdown, and a calm explanation.
- Eligible state shows amount input, max action, post-withdraw preview, and a confirmation card before the wallet opens.
- Owner-only and unsupported/disconnected states remain explicit and non-interactive.

## Refresh Strategy After Withdrawal
- On confirmed withdrawal, the app invalidates vault queries through the existing session vault store bridge.
- Vault detail and My Vaults then refresh from updated onchain reads.
- Success state clears the form and leaves the route in a clean updated state.

## Activity Update Strategy
- Confirmed withdrawals are written into session activity immediately after receipt confirmation.
- Vault detail preview and activity timeline merge indexed fallback data with session-confirmed events.
- Full indexed history remains a later backend concern.

## Error / Recovery Behavior
- Validation blocks locked, non-owner, disconnected, unsupported-network, zero-balance, and oversize withdrawal attempts.
- Wallet rejection, provider absence, and transaction failure stay explicit and retryable.
- The app does not imply success before receipt confirmation.
- Active flow state resets safely on wallet/vault changes and component unmount.

## What Remains For Later Phases
- Cooldown unlock.
- Guardian approval.
- Full backend-indexed activity and metadata recovery.
- Broader live QA against deployed Base Sepolia and Base mainnet contracts.

## Risks and Edge Cases
- Unlock-time transitions during an open session need continued QA on device and web.
- Partial data lag after confirmed withdrawal still depends on RPC freshness and later indexer rollout.
- Owner-only gating depends on connected wallet equality and current chain alignment.
- Withdrawal copy and countdown formatting should continue to be reviewed in both English and Arabic as product surfaces expand.
