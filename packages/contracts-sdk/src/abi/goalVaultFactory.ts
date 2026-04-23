export const goalVaultFactoryAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "usdc",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getVaultsByOwner",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "createVault",
    inputs: [
      { name: "targetAmount", type: "uint256" },
      { name: "unlockAt", type: "uint64" },
    ],
    outputs: [{ name: "vault", type: "address" }],
  },
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
