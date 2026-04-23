export const productConfig = {
  name: "Goal Vault",
  shortName: "Goal Vault",
  chainName: "Base",
  assetSymbol: "USDC",
  launchLocale: "en",
} as const;

export const appCopy = {
  heroTitle: "Protect the money meant for something that matters.",
  heroSubtitle:
    "Create one goal, fund it in USDC, and keep withdrawals locked until the rule allows it.",
} as const;

export * from "./chains";
export * from "./contracts";
export * from "./env";
export * from "./tokens";
