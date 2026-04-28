# Pocket Vault Demo Script

## Opening Framing
- Pocket Vault is a Base-native USDC savings product for one goal at a time.
- The core promise is simple: create one vault, keep deposits open, and prevent withdrawals until the unlock date.
- The product stays intentionally narrow so the trust model stays clear.

## Ideal Screen Order
1. Landing
2. My Vaults
3. Create Vault
4. Vault creation success
5. Vault Detail
6. Activity
7. Eligible withdrawal state if a prepared vault exists

## Per-Screen Talking Points

### Landing
- Highlight the promise: protect money you do not want to break.
- Point out the example vault artifact and the Base plus USDC boundary.
- Click `Open the app shell`.

### My Vaults
- If empty, use the guided steps card to explain the first-run journey.
- If populated, show the saved total, vault count, and eligibility summary.
- Click `Create vault`.

### Create Vault
- Explain one goal per vault and why the first rule is time lock only.
- Fill in a goal, target amount, optional note, and unlock date.
- On review, point out the unlock date, network, and post-confirmation sequence.
- Click `Create vault`.

### Vault Creation Success
- Explain that the vault is active onchain and the app is ready for funding later.
- Point out the next-step guidance: open the vault, fund it, then revisit activity.
- Click `View vault`.

### Vault Detail
- Show the goal, saved amount, target amount, and unlock date together.
- Explain that the rule is enforced onchain and metadata sync never changes withdrawal truth.
- If the vault is unfunded, use the guided next-step card to explain the next move.
- If funded, point out the progress, deposit panel, and withdrawal eligibility area.

### Activity
- Show the indexed timeline if available.
- If activity is empty, use the guided steps card to explain how the timeline fills in.
- Emphasize that activity can lag chain confirmation briefly, but the app keeps that state honest.

### Eligible Withdrawal State
- Use a prepared eligible vault if available.
- Show that withdrawals remain blocked until the rule allows them.
- If no eligible vault exists, stop after the funded detail and activity screens.

## Short Demo Route
- Landing
- My Vaults
- Create Vault review
- Vault creation success
- Vault Detail

## Full Demo Route
- Landing
- My Vaults
- Create Vault
- Vault creation success
- Vault Detail
- Deposit flow on a prepared or newly funded vault
- Activity
- Eligible withdrawal state

## Fallback Route When Live State Is Sparse
- Start on Landing and call out the labeled example vault artifact.
- Use My Vaults empty guidance and Create Vault review to explain the real flow.
- If chain or backend activity is delayed, stop on the success or detail state and explain the sync model honestly.
