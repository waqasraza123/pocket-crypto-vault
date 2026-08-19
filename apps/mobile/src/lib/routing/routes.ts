import type { Href } from "expo-router";

export const routes = {
  landing: "/" as Href,
  signIn: "/sign-in" as Href,
  createAccount: "/create-account" as Href,
  howItWorks: "/how-it-works" as Href,
  security: "/security" as Href,
  appHome: "/vaults" as Href,
  createVault: "/vaults/new" as Href,
  activity: "/activity" as Href,
  support: "/support" as Href,
  vaultDetail: (vaultAddress: string) => `/vaults/${vaultAddress}` as Href,
} as const;
