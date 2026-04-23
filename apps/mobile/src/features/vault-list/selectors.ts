import type { VaultSummary } from "../../types";

export const getTotalSaved = (vaults: VaultSummary[]) =>
  vaults.reduce((sum, vault) => sum + vault.savedAmount, 0);

export const getUnlockedVaultCount = (vaults: VaultSummary[]) =>
  vaults.filter((vault) => vault.status === "unlocked").length;
