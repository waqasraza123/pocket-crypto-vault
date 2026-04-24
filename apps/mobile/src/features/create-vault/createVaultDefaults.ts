import type { CreateVaultInput } from "../../types";

export const createVaultDefaults: CreateVaultInput = {
  goalName: "",
  category: "",
  note: "",
  targetAmount: "",
  accentTheme: "",
  ruleType: "timeLock",
  unlockDate: "2026-08-30",
  cooldownDays: "7",
  guardianAddress: "",
};
