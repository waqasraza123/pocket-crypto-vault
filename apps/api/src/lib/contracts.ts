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
] as const;

export const readGoalVaultSummaryForIndexer = async ({
  client,
  vaultAddress,
}: {
  client: {
    readContract: (args: {
      address: Address;
      abi: typeof goalVaultAbi;
      functionName: "getSummary";
    }) => Promise<readonly [Address, Address, bigint, bigint, bigint, bigint, bigint, boolean]>;
  };
  vaultAddress: Address;
}) => {
  const summary = await client.readContract({
    address: vaultAddress,
    abi: goalVaultAbi,
    functionName: "getSummary",
  });

  return {
    owner: summary[0],
    asset: summary[1],
    targetAmount: summary[2],
    unlockAt: summary[3],
    totalDeposited: summary[4],
    totalWithdrawn: summary[5],
    currentBalance: summary[6],
    isUnlocked: summary[7],
  };
};
