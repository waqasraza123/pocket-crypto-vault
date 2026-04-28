export const productConfig = {
  name: "Pocket Vault",
  shortName: "Pocket Vault",
  chainName: "Base",
  assetSymbol: "USDC",
  launchLocale: "en",
} as const;

export const appCopy = {
  heroTitle: "Save pocket money in crypto.",
  heroSubtitle:
    "Create one student savings vault, fund it in USDC, and keep emergency money protected until your rule allows withdrawal.",
} as const;

export * from "./app-metadata";
export * from "./chains";
export * from "./contracts";
export * from "./deployment";
export * from "./env";
export * from "./tokens";
