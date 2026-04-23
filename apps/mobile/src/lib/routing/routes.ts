import type { Href } from "expo-router";

export const routes = {
  landing: "/" as Href,
  howItWorks: "/how-it-works" as Href,
  security: "/security" as Href,
  appHome: "/(app)" as Href,
  createVault: "/vaults/new" as Href,
  activity: "/activity" as Href,
  vaultDetail: (vaultAddress: string) => `/vaults/${vaultAddress}` as Href,
} as const;
