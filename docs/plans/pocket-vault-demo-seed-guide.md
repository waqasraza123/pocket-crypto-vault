# Pocket Vault Demo Seed Guide

## Purpose
- Prepare honest demo state without adding fake product logic.

## Recommended Demo Wallet Setup
- One wallet on Base Sepolia with enough ETH for gas.
- Enough test USDC for one create flow and at least one deposit.

## Recommended Demo Vault Set
- One fresh vault with no deposits yet.
- One funded vault with indexed activity.
- One vault created far enough in advance to be eligible for withdrawal if the demo needs that step.

## Preparation Flow
1. Configure the app and API with the documented Phase 9 env values.
2. Start the API and mobile app.
3. Connect the prepared wallet.
4. Create a vault with a real goal name and a near-term unlock date for walkthrough use.
5. Deposit a visible amount of USDC so progress and activity become screenshot-friendly.
6. Wait for the API activity sync to catch up before recording or presenting.

## Reset Guidance
- Use a separate demo wallet instead of mutating a personal staging wallet.
- If the demo wallet gets cluttered, rotate to a fresh wallet and recreate the target vault set.

## Honesty Rules
- Do not present public example content as signed-in data.
- Do not fake balances, transactions, or withdrawals in authenticated flows.
- If a withdrawal-ready vault is not available, stop the demo earlier and explain the rule clearly.
