import assert from "node:assert/strict";
import test from "node:test";

import type { SyncFreshnessSnapshot } from "@goal-vault/shared";

import type { PersistedVaultEventRecord, PersistedVaultRecord } from "../persistence/ports";
import { serializeVaultActivityItem } from "../vault-events/vault-events.serializers";
import { serializeVaultSummary } from "./vaults.serializers";

const freshness: SyncFreshnessSnapshot = {
  freshness: "current",
  lastSyncedAt: "2026-04-25T00:00:00.000Z",
  latestIndexedBlock: 100,
  latestChainBlock: 101,
  lagBlocks: 1,
};

const createVaultRecord = (overrides: Partial<PersistedVaultRecord>): PersistedVaultRecord => ({
  key: "84532:0x7777777777777777777777777777777777777777",
  chainId: 84532,
  contractAddress: "0x7777777777777777777777777777777777777777",
  ownerWallet: "0x1111111111111111111111111111111111111111",
  assetAddress: "0x2222222222222222222222222222222222222222",
  targetAmountAtomic: "5000000000",
  ruleType: "timeLock",
  unlockDate: "2026-05-01T00:00:00.000Z",
  cooldownDurationSeconds: null,
  guardianAddress: null,
  unlockRequestedAt: null,
  unlockEligibleAt: null,
  unlockRequestStatus: "not_requested",
  guardianApprovalState: "not_required",
  guardianDecisionAt: null,
  createdAt: "2026-04-25T00:00:00.000Z",
  createdTxHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  displayName: "Emergency Reserve",
  category: "Safety",
  note: null,
  accentTheme: "sage",
  metadataStatus: "saved",
  reconciliationStatus: "metadata_complete",
  totalDepositedAtomic: "1500000000",
  totalWithdrawnAtomic: "0",
  currentBalanceAtomic: "1500000000",
  lastActivityAt: "2026-04-25T01:00:00.000Z",
  lastIndexedAt: "2026-04-25T01:00:00.000Z",
  onchainFound: true,
  ...overrides,
});

const createEvent = (eventType: PersistedVaultEventRecord["eventType"]): PersistedVaultEventRecord => ({
  id: `${eventType}:1`,
  chainId: 84532,
  txHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  blockNumber: 50,
  logIndex: 1,
  vaultAddress: "0x7777777777777777777777777777777777777777",
  ownerAddress: "0x1111111111111111111111111111111111111111",
  actorAddress: "0x1111111111111111111111111111111111111111",
  eventType,
  amountAtomic: null,
  occurredAt: "2026-04-25T01:00:00.000Z",
  indexedAt: "2026-04-25T01:00:01.000Z",
});

test("serializeVaultSummary preserves rule-specific serializer output across all rule types", () => {
  const timeLock = serializeVaultSummary({
    vault: createVaultRecord({}),
    events: [],
    freshness,
  });
  const cooldown = serializeVaultSummary({
    vault: createVaultRecord({
      ruleType: "cooldownUnlock",
      unlockDate: null,
      cooldownDurationSeconds: 604800,
      unlockRequestedAt: "2026-04-25T02:00:00.000Z",
      unlockEligibleAt: "2026-05-02T02:00:00.000Z",
      unlockRequestStatus: "pending",
    }),
    events: [],
    freshness,
  });
  const guardian = serializeVaultSummary({
    vault: createVaultRecord({
      ruleType: "guardianApproval",
      unlockDate: null,
      guardianAddress: "0x3333333333333333333333333333333333333333",
      unlockRequestedAt: "2026-04-25T02:00:00.000Z",
      unlockRequestStatus: "pending",
      guardianApprovalState: "pending",
    }),
    events: [],
    freshness,
  });

  assert.equal(timeLock.ruleSummary.type, "timeLock");
  assert.equal(cooldown.ruleSummary.type, "cooldownUnlock");
  assert.equal(cooldown.status, "unlocking");
  assert.equal(guardian.ruleSummary.type, "guardianApproval");
  assert.equal(guardian.ruleSummary.guardianDecision, "pending");
  assert.equal(guardian.status, "unlocking");
});

test("serializeVaultActivityItem preserves unlock and guardian lifecycle event types", () => {
  const vault = createVaultRecord({
    ruleType: "guardianApproval",
    guardianAddress: "0x3333333333333333333333333333333333333333",
    guardianApprovalState: "pending",
    unlockRequestStatus: "pending",
  });

  assert.equal(serializeVaultActivityItem({ event: createEvent("unlock_requested"), vault }).eventType, "unlock_requested");
  assert.equal(serializeVaultActivityItem({ event: createEvent("unlock_canceled"), vault }).eventType, "unlock_canceled");
  assert.equal(serializeVaultActivityItem({ event: createEvent("guardian_approved"), vault }).eventType, "guardian_approved");
  assert.equal(serializeVaultActivityItem({ event: createEvent("guardian_rejected"), vault }).eventType, "guardian_rejected");
});
