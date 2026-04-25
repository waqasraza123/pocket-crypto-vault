import assert from "node:assert/strict";
import test from "node:test";

import { parseVaultDetailResponse } from "./mappers";

test("parseVaultDetailResponse preserves unlock lifecycle activity and guardian rule fields", () => {
  const response = parseVaultDetailResponse({
    item: {
      address: "0x7777777777777777777777777777777777777777",
      chainId: 84532,
      assetAddress: "0x2222222222222222222222222222222222222222",
      ownerAddress: "0x1111111111111111111111111111111111111111",
      goalName: "Emergency Reserve",
      targetAmount: 5000,
      savedAmount: 1500,
      unlockDate: null,
      ruleType: "guardianApproval",
      ruleSummary: {
        type: "guardianApproval",
        guardianAddress: "0x3333333333333333333333333333333333333333",
        guardianLabel: "0x3333…3333",
        unlockRequestedAt: "2026-04-25T12:00:00.000Z",
        guardianDecision: "pending",
        guardianDecisionAt: null,
      },
      status: "unlocking",
      accentTheme: "sage",
      accentTone: "#66735c",
      metadataStatus: "saved",
      targetAmountAtomic: "5000000000",
      savedAmountAtomic: "1500000000",
      totalDepositedAtomic: "1500000000",
      totalWithdrawnAtomic: "0",
      currentBalanceAtomic: "1500000000",
      progressRatio: 0.3,
      source: "backend",
      reconciliationStatus: "metadata_complete",
      activityCount: 2,
      lastActivityAt: "2026-04-25T12:10:00.000Z",
      freshness: {
        freshness: "current",
        lastSyncedAt: "2026-04-25T12:10:05.000Z",
        latestIndexedBlock: 200,
        latestChainBlock: 201,
        lagBlocks: 1,
      },
      ownerLabel: "0x1111…1111",
      normalizedActivity: [
        {
          id: "unlock:1",
          chainId: 84532,
          txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          blockNumber: 180,
          logIndex: 0,
          vaultAddress: "0x7777777777777777777777777777777777777777",
          ownerAddress: "0x1111111111111111111111111111111111111111",
          actorAddress: "0x1111111111111111111111111111111111111111",
          eventType: "unlock_requested",
          amountAtomic: null,
          occurredAt: "2026-04-25T12:00:00.000Z",
          indexedAt: "2026-04-25T12:00:05.000Z",
          displayName: "Emergency Reserve",
          metadataStatus: "saved",
          ruleType: "guardianApproval",
          unlockRequestStatus: "pending",
          guardianApprovalState: "pending",
        },
        {
          id: "guardian:1",
          chainId: 84532,
          txHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          blockNumber: 181,
          logIndex: 0,
          vaultAddress: "0x7777777777777777777777777777777777777777",
          ownerAddress: "0x1111111111111111111111111111111111111111",
          actorAddress: "0x3333333333333333333333333333333333333333",
          eventType: "guardian_approved",
          amountAtomic: null,
          occurredAt: "2026-04-25T12:10:00.000Z",
          indexedAt: "2026-04-25T12:10:05.000Z",
          displayName: "Emergency Reserve",
          metadataStatus: "saved",
          ruleType: "guardianApproval",
          unlockRequestStatus: "approved",
          guardianApprovalState: "approved",
        },
      ],
    },
  });

  assert.equal(response.item.ruleSummary.type, "guardianApproval");
  assert.equal(response.item.withdrawEligibility.unlockRequestStatus, "pending");
  assert.equal(response.item.activityPreview[0].type, "unlock_requested");
  assert.equal(response.item.activityPreview[1].type, "guardian_approved");
});
