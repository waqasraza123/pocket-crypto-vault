import type { VaultActivityEvent, VaultDetail, VaultSummary } from "@goal-vault/shared";

const getLockedStatus = (vault: VaultSummary | VaultDetail) => {
  if (vault.currentBalanceAtomic === 0n && vault.totalWithdrawnAtomic > 0n) {
    return "closed" as const;
  }

  if (vault.currentBalanceAtomic === 0n && vault.totalDepositedAtomic === 0n) {
    return "active" as const;
  }

  return "locked" as const;
};

const getUnlockedStatus = (vault: VaultSummary | VaultDetail) => {
  if (vault.currentBalanceAtomic === 0n && vault.totalWithdrawnAtomic > 0n) {
    return "closed" as const;
  }

  if (vault.currentBalanceAtomic === 0n) {
    return "active" as const;
  }

  return "unlocked" as const;
};

const getLatestRuleLifecycleEvent = ({
  sessionEvents,
  vaultAddress,
}: {
  sessionEvents: VaultActivityEvent[];
  vaultAddress: `0x${string}`;
}) =>
  [...sessionEvents]
    .filter(
      (event) =>
        event.vaultAddress.toLowerCase() === vaultAddress.toLowerCase() &&
        (event.type === "unlock_requested" ||
          event.type === "unlock_canceled" ||
          event.type === "guardian_approved" ||
          event.type === "guardian_rejected"),
    )
    .sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1))[0] ?? null;

export const applySessionRuleActivityToVault = <TVault extends VaultSummary | VaultDetail>({
  sessionEvents,
  vault,
}: {
  sessionEvents: VaultActivityEvent[];
  vault: TVault;
}): TVault => {
  const latestRuleEvent = getLatestRuleLifecycleEvent({
    sessionEvents,
    vaultAddress: vault.address,
  });

  if (!latestRuleEvent) {
    return vault;
  }

  if (vault.ruleSummary.type === "cooldownUnlock") {
    if (latestRuleEvent.type === "unlock_requested") {
      const unlockEligibleTimestampMs = Date.parse(latestRuleEvent.occurredAt) + vault.ruleSummary.cooldownDurationSeconds * 1000;
      const unlockEligibleAt = new Date(unlockEligibleTimestampMs).toISOString();

      return {
        ...vault,
        unlockDate: unlockEligibleAt,
        status: "unlocking",
        ruleSummary: {
          ...vault.ruleSummary,
          unlockRequestedAt: latestRuleEvent.occurredAt,
          unlockEligibleAt,
          unlockEligibleTimestampMs,
        },
      };
    }

    if (latestRuleEvent.type === "unlock_canceled") {
      return {
        ...vault,
        unlockDate: null,
        status: getLockedStatus(vault),
        ruleSummary: {
          ...vault.ruleSummary,
          unlockRequestedAt: null,
          unlockEligibleAt: null,
          unlockEligibleTimestampMs: null,
        },
      };
    }

    return vault;
  }

  if (vault.ruleSummary.type === "guardianApproval") {
    if (latestRuleEvent.type === "unlock_requested") {
      return {
        ...vault,
        status: "unlocking",
        ruleSummary: {
          ...vault.ruleSummary,
          unlockRequestedAt: latestRuleEvent.occurredAt,
          guardianDecision: "pending",
          guardianDecisionAt: null,
        },
      };
    }

    if (latestRuleEvent.type === "unlock_canceled") {
      return {
        ...vault,
        status: getLockedStatus(vault),
        ruleSummary: {
          ...vault.ruleSummary,
          unlockRequestedAt: null,
          guardianDecision: "not_requested",
          guardianDecisionAt: null,
        },
      };
    }

    if (latestRuleEvent.type === "guardian_approved") {
      return {
        ...vault,
        status: getUnlockedStatus(vault),
        ruleSummary: {
          ...vault.ruleSummary,
          unlockRequestedAt: vault.ruleSummary.unlockRequestedAt ?? latestRuleEvent.occurredAt,
          guardianDecision: "approved",
          guardianDecisionAt: latestRuleEvent.occurredAt,
        },
      };
    }

    if (latestRuleEvent.type === "guardian_rejected") {
      return {
        ...vault,
        status: getLockedStatus(vault),
        ruleSummary: {
          ...vault.ruleSummary,
          unlockRequestedAt: vault.ruleSummary.unlockRequestedAt ?? latestRuleEvent.occurredAt,
          guardianDecision: "rejected",
          guardianDecisionAt: latestRuleEvent.occurredAt,
        },
      };
    }
  }

  return vault;
};
