import { z } from "zod";

import { isPositiveAmount } from "./amount";
import { isFutureDate } from "./date";

export const vaultAccentThemes = ["sand", "sage", "sky", "terracotta"] as const;

export type CreateVaultValidationMessages = {
  goalNameRequired: string;
  goalNameMax: string;
  categoryMax: string;
  noteMax: string;
  targetAmount: string;
  unlockDate: string;
};

export const defaultCreateVaultValidationMessages: CreateVaultValidationMessages = {
  goalNameRequired: "Add a clear goal name.",
  goalNameMax: "Keep the name concise.",
  categoryMax: "Keep the category under 32 characters.",
  noteMax: "Keep the note under 160 characters.",
  targetAmount: "Enter a target amount greater than 0.",
  unlockDate: "Choose a future unlock date.",
};

export const createCreateVaultSchema = (
  messages: CreateVaultValidationMessages = defaultCreateVaultValidationMessages,
) =>
  z.object({
    goalName: z.string().trim().min(2, messages.goalNameRequired).max(48, messages.goalNameMax),
    category: z.string().trim().max(32, messages.categoryMax),
    note: z.string().trim().max(160, messages.noteMax),
    targetAmount: z
      .string()
      .trim()
      .refine(isPositiveAmount, messages.targetAmount),
    accentTheme: z
      .enum(vaultAccentThemes)
      .or(z.literal(""))
      .transform((value) => value),
    unlockDate: z.string().trim().refine(isFutureDate, messages.unlockDate),
  });

export const createVaultSchema = createCreateVaultSchema();
