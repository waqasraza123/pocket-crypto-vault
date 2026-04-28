import assert from "node:assert/strict";
import test from "node:test";

import type { VaultActivityEvent, VaultSummary } from "@pocket-vault/shared";

import { applySessionRuleActivityToVault } from "./rule-overrides";

const baseVault: VaultSummary = {
  address: "0x7777777777777777777777777777777777777777",
  chainId: 84532,
  assetAddress: "0x2222222222222222222222222222222222222222",
  ownerAddress: "0x1111111111111111111111111111111111111111",
  goalName: "Emergency Reserve",
  targetAmount: 5000,
  savedAmount: 1500,
  unlockDate: null,
  ruleType: "cooldownUnlock",
  ruleSummary: {
    type: "cooldownUnlock",
    cooldownDurationSeconds: 604800,
    cooldownDurationDays: 7,
    cooldownDurationLabel: "7 days",
    unlockRequestedAt: null,
    unlockEligibleAt: null,
    unlockEligibleTimestampMs: null,
  },
  status: "locked",
  accentTheme: "sage",
  accentTone: "#64815c",
  metadataStatus: "saved",
  targetAmountAtomic: 5_000_000_000n,
  savedAmountAtomic: 1_500_000_000n,
  totalDepositedAtomic: 1_500_000_000n,
  totalWithdrawnAtomic: 0n,
  currentBalanceAtomic: 1_500_000_000n,
  progressRatio: 0.3,
  source: "backend",
};

const createEvent = ({
  occurredAt,
  type,
}: {
  occurredAt: string;
  type: VaultActivityEvent["type"];
}): VaultActivityEvent => ({
  id: `${type}:${occurredAt}`,
  vaultAddress: baseVault.address,
  chainId: baseVault.chainId,
  type,
  title: type,
  subtitle: baseVault.goalName,
  occurredAt,
  txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  source: "session",
});

test("applySessionRuleActivityToVault projects a pending cooldown request into the dashboard model", () => {
  const updated = applySessionRuleActivityToVault({
    vault: baseVault,
    sessionEvents: [
      createEvent({
        type: "unlock_requested",
        occurredAt: "2026-04-25T12:00:00.000Z",
      }),
    ],
  });

  assert.equal(updated.ruleSummary.type, "cooldownUnlock");
  if (updated.ruleSummary.type !== "cooldownUnlock") {
    throw new Error("Expected cooldown rule summary.");
  }

  assert.equal(updated.status, "unlocking");
  assert.equal(updated.ruleSummary.unlockRequestedAt, "2026-04-25T12:00:00.000Z");
  assert.equal(updated.ruleSummary.unlockEligibleAt, "2026-05-02T12:00:00.000Z");
  assert.equal(updated.unlockDate, "2026-05-02T12:00:00.000Z");
});

test("applySessionRuleActivityToVault clears a canceled cooldown request", () => {
  const updated = applySessionRuleActivityToVault({
    vault: {
      ...baseVault,
      status: "unlocking",
      unlockDate: "2026-05-02T12:00:00.000Z",
      ruleSummary: {
        ...baseVault.ruleSummary,
        unlockRequestedAt: "2026-04-25T12:00:00.000Z",
        unlockEligibleAt: "2026-05-02T12:00:00.000Z",
        unlockEligibleTimestampMs: Date.parse("2026-05-02T12:00:00.000Z"),
      },
    },
    sessionEvents: [
      createEvent({
        type: "unlock_canceled",
        occurredAt: "2026-04-25T12:10:00.000Z",
      }),
    ],
  });

  assert.equal(updated.ruleSummary.type, "cooldownUnlock");
  if (updated.ruleSummary.type !== "cooldownUnlock") {
    throw new Error("Expected cooldown rule summary.");
  }

  assert.equal(updated.status, "locked");
  assert.equal(updated.ruleSummary.unlockRequestedAt, null);
  assert.equal(updated.ruleSummary.unlockEligibleAt, null);
  assert.equal(updated.unlockDate, null);
});

test("applySessionRuleActivityToVault projects guardian approvals and rejections into the local vault view", () => {
  const guardianVault: VaultSummary = {
    ...baseVault,
    ruleType: "guardianApproval",
    ruleSummary: {
      type: "guardianApproval",
      guardianAddress: "0x3333333333333333333333333333333333333333",
      guardianLabel: "0x3333…3333",
      unlockRequestedAt: "2026-04-25T12:00:00.000Z",
      guardianDecision: "pending",
      guardianDecisionAt: null,
    },
  };

  const approved = applySessionRuleActivityToVault({
    vault: guardianVault,
    sessionEvents: [
      createEvent({
        type: "guardian_approved",
        occurredAt: "2026-04-25T12:15:00.000Z",
      }),
    ],
  });
  const rejected = applySessionRuleActivityToVault({
    vault: guardianVault,
    sessionEvents: [
      createEvent({
        type: "guardian_rejected",
        occurredAt: "2026-04-25T12:20:00.000Z",
      }),
    ],
  });

  assert.equal(approved.ruleSummary.type, "guardianApproval");
  if (approved.ruleSummary.type !== "guardianApproval") {
    throw new Error("Expected guardian rule summary.");
  }

  assert.equal(approved.status, "unlocked");
  assert.equal(approved.ruleSummary.guardianDecision, "approved");
  assert.equal(approved.ruleSummary.guardianDecisionAt, "2026-04-25T12:15:00.000Z");

  assert.equal(rejected.ruleSummary.type, "guardianApproval");
  if (rejected.ruleSummary.type !== "guardianApproval") {
    throw new Error("Expected guardian rule summary.");
  }

  assert.equal(rejected.status, "locked");
  assert.equal(rejected.ruleSummary.guardianDecision, "rejected");
  assert.equal(rejected.ruleSummary.guardianDecisionAt, "2026-04-25T12:20:00.000Z");
});
