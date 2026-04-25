import assert from "node:assert/strict";
import test from "node:test";

import { createUnlockActivityEvent, getUnlockActionLabel } from "./unlock-flow";

const vault = {
  address: "0x7777777777777777777777777777777777777777" as const,
  goalName: "Emergency Reserve",
};

test("createUnlockActivityEvent maps each unlock action to a deterministic local activity record", () => {
  const chainId = 84532;
  const ownerAddress = "0x1111111111111111111111111111111111111111" as const;
  const txHash = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
  const occurredAt = "2026-04-25T12:00:00.000Z";

  const requested = createUnlockActivityEvent({
    action: "request",
    chainId,
    ownerAddress,
    txHash,
    vault,
    occurredAt,
  });
  const canceled = createUnlockActivityEvent({
    action: "cancel",
    chainId,
    ownerAddress,
    txHash,
    vault,
    occurredAt,
  });
  const approved = createUnlockActivityEvent({
    action: "approve",
    chainId,
    ownerAddress,
    txHash,
    vault,
    occurredAt,
  });
  const rejected = createUnlockActivityEvent({
    action: "reject",
    chainId,
    ownerAddress,
    txHash,
    vault,
    occurredAt,
  });

  assert.equal(requested.type, "unlock_requested");
  assert.equal(requested.id, `${txHash.toLowerCase()}:unlock_requested`);
  assert.equal(canceled.type, "unlock_canceled");
  assert.equal(approved.type, "guardian_approved");
  assert.equal(rejected.type, "guardian_rejected");
});

test("getUnlockActionLabel returns the post-confirmation copy for each action", () => {
  assert.equal(getUnlockActionLabel("request"), "Unlock requested.");
  assert.equal(getUnlockActionLabel("cancel"), "Unlock request canceled.");
  assert.equal(getUnlockActionLabel("approve"), "Guardian approval submitted.");
  assert.equal(getUnlockActionLabel("reject"), "Guardian rejection submitted.");
});
