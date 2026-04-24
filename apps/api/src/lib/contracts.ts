import type { Address } from "viem";

export const goalVaultFactoryAbi = [
  {
    type: "event",
    name: "VaultCreated",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "vault", type: "address" },
      { indexed: true, name: "asset", type: "address" },
      { indexed: false, name: "targetAmount", type: "uint256" },
      { indexed: false, name: "unlockAt", type: "uint64" },
      { indexed: false, name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "VaultCreatedV2",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "vault", type: "address" },
      { indexed: true, name: "asset", type: "address" },
      { indexed: false, name: "targetAmount", type: "uint256" },
      { indexed: false, name: "ruleType", type: "uint8" },
      { indexed: false, name: "unlockAt", type: "uint64" },
      { indexed: false, name: "cooldownDuration", type: "uint64" },
      { indexed: false, name: "guardian", type: "address" },
      { indexed: false, name: "createdAt", type: "uint256" },
    ],
  },
] as const;

export const goalVaultAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "getSummary",
    inputs: [],
    outputs: [
      { name: "vaultOwner", type: "address" },
      { name: "vaultAsset", type: "address" },
      { name: "vaultTargetAmount", type: "uint256" },
      { name: "vaultUnlockAt", type: "uint64" },
      { name: "vaultTotalDeposited", type: "uint256" },
      { name: "vaultTotalWithdrawn", type: "uint256" },
      { name: "vaultBalance", type: "uint256" },
      { name: "vaultIsUnlocked", type: "bool" },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getRuleState",
    inputs: [],
    outputs: [
      { name: "vaultRuleType", type: "uint8" },
      { name: "vaultUnlockAt", type: "uint64" },
      { name: "vaultCooldownDuration", type: "uint64" },
      { name: "vaultGuardian", type: "address" },
      { name: "vaultUnlockRequestedAt", type: "uint64" },
      { name: "vaultGuardianDecision", type: "uint8" },
      { name: "vaultGuardianDecisionAt", type: "uint64" },
      { name: "vaultUnlockEligibleAt", type: "uint64" },
      { name: "vaultWithdrawalEligible", type: "bool" },
    ],
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "UnlockRequested",
    inputs: [
      { indexed: true, name: "requestedBy", type: "address" },
      { indexed: true, name: "ruleType", type: "uint8" },
      { indexed: false, name: "availableAt", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "UnlockCanceled",
    inputs: [
      { indexed: true, name: "canceledBy", type: "address" },
      { indexed: true, name: "ruleType", type: "uint8" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "GuardianApproved",
    inputs: [
      { indexed: true, name: "guardian", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "GuardianRejected",
    inputs: [
      { indexed: true, name: "guardian", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
] as const;

export const readGoalVaultSummaryForIndexer = async ({
  client,
  vaultAddress,
}: {
  client: {
    readContract: (args: { address: Address; abi: readonly unknown[]; functionName: string }) => Promise<readonly unknown[]>;
  };
  vaultAddress: Address;
}) => {
  const summary = (await client.readContract({
    address: vaultAddress,
    abi: goalVaultAbi,
    functionName: "getSummary",
  })) as readonly [Address, Address, bigint, bigint, bigint, bigint, bigint, boolean];

  let ruleType = 0n;
  let cooldownDuration = 0n;
  let guardian: Address | null = null;
  let unlockRequestedAt = 0n;
  let guardianDecision = 0n;
  let guardianDecisionAt = 0n;
  let unlockEligibleAt = summary[3];
  let isRuleStateSupported = false;

  try {
    const ruleState = (await client.readContract({
      address: vaultAddress,
      abi: goalVaultAbi,
      functionName: "getRuleState",
    })) as readonly [bigint, bigint, bigint, Address, bigint, bigint, bigint, bigint, boolean];

    ruleType = ruleState[0];
    cooldownDuration = ruleState[2];
    guardian = ruleState[3] !== "0x0000000000000000000000000000000000000000" ? ruleState[3] : null;
    unlockRequestedAt = ruleState[4];
    guardianDecision = ruleState[5];
    guardianDecisionAt = ruleState[6];
    unlockEligibleAt = ruleState[7];
    isRuleStateSupported = true;
  } catch {}

  return {
    owner: summary[0],
    asset: summary[1],
    targetAmount: summary[2],
    unlockAt: summary[3],
    totalDeposited: summary[4],
    totalWithdrawn: summary[5],
    currentBalance: summary[6],
    isUnlocked: summary[7],
    ruleType,
    cooldownDuration,
    guardian,
    unlockRequestedAt,
    guardianDecision,
    guardianDecisionAt,
    unlockEligibleAt,
    isRuleStateSupported,
  };
};
