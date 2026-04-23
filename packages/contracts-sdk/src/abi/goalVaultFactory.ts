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
] as const;
