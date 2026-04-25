import assert from "node:assert/strict";
import test from "node:test";

import { mapVaultSummary } from "./vault-mappers";

test("mapVaultSummary preserves cooldown and guardian rule state in the frontend-facing model", () => {
  const cooldownVault = mapVaultSummary({
    address: "0x7777777777777777777777777777777777777777",
    chainId: 84532,
    summary: {
      owner: "0x1111111111111111111111111111111111111111",
      asset: "0x2222222222222222222222222222222222222222",
      targetAmount: 5_000_000_000n,
      unlockAt: 0n,
      totalDeposited: 1_500_000_000n,
      totalWithdrawn: 0n,
      currentBalance: 1_500_000_000n,
      isUnlocked: false,
      ruleType: "cooldownUnlock",
      cooldownDuration: 604800n,
      guardian: null,
      unlockRequestedAt: 1_700_000_000n,
      guardianDecision: "not_required",
      guardianDecisionAt: 0n,
      unlockEligibleAt: 1_700_604_800n,
      isRuleStateSupported: true,
    },
  });
  const guardianVault = mapVaultSummary({
    address: "0x8888888888888888888888888888888888888888",
    chainId: 84532,
    summary: {
      owner: "0x1111111111111111111111111111111111111111",
      asset: "0x2222222222222222222222222222222222222222",
      targetAmount: 3_000_000_000n,
      unlockAt: 0n,
      totalDeposited: 1_000_000_000n,
      totalWithdrawn: 0n,
      currentBalance: 1_000_000_000n,
      isUnlocked: false,
      ruleType: "guardianApproval",
      cooldownDuration: 0n,
      guardian: "0x3333333333333333333333333333333333333333",
      unlockRequestedAt: 1_700_000_100n,
      guardianDecision: "pending",
      guardianDecisionAt: 0n,
      unlockEligibleAt: 0n,
      isRuleStateSupported: true,
    },
  });

  assert.equal(cooldownVault.ruleSummary.type, "cooldownUnlock");
  if (cooldownVault.ruleSummary.type !== "cooldownUnlock") {
    throw new Error("Expected cooldown rule summary.");
  }

  assert.equal(cooldownVault.status, "unlocking");
  assert.equal(cooldownVault.ruleSummary.cooldownDurationSeconds, 604800);
  assert.equal(cooldownVault.ruleSummary.unlockRequestedAt, "2023-11-14T22:13:20.000Z");

  assert.equal(guardianVault.ruleSummary.type, "guardianApproval");
  if (guardianVault.ruleSummary.type !== "guardianApproval") {
    throw new Error("Expected guardian rule summary.");
  }

  assert.equal(guardianVault.status, "unlocking");
  assert.equal(guardianVault.ruleSummary.guardianAddress, "0x3333333333333333333333333333333333333333");
  assert.equal(guardianVault.ruleSummary.guardianDecision, "pending");
});
