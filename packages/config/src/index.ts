export const productConfig = {
  name: "Goal Vault",
  shortName: "Goal Vault",
  chainName: "Base",
  assetSymbol: "USDC",
  launchLocale: "en",
} as const;

export const supportedChainConfig = {
  primary: {
    id: 8453,
    name: "Base",
  },
  testnet: {
    id: 84532,
    name: "Base Sepolia",
  },
} as const;

export const appCopy = {
  heroTitle: "Protect the money meant for something that matters.",
  heroSubtitle:
    "Create one goal, fund it in USDC, and keep withdrawals locked until the rule allows it.",
} as const;
