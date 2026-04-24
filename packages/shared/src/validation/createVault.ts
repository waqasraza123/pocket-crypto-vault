import { z } from "zod";
import { isAddress } from "viem";

import { isPositiveAmount } from "./amount";
import { isFutureDate } from "./date";

export const vaultAccentThemes = ["sand", "sage", "sky", "terracotta"] as const;

export type CreateVaultValidationMessages = {
  goalNameRequired: string;
  goalNameMax: string;
  categoryMax: string;
  noteMax: string;
  targetAmount: string;
  ruleType: string;
  unlockDate: string;
  cooldownDays: string;
  guardianAddress: string;
  guardianNotOwner: string;
};

export const defaultCreateVaultValidationMessages: CreateVaultValidationMessages = {
  goalNameRequired: "Add a clear goal name.",
  goalNameMax: "Keep the name concise.",
  categoryMax: "Keep the category under 32 characters.",
  noteMax: "Keep the note under 160 characters.",
  targetAmount: "Enter a target amount greater than 0.",
  ruleType: "Choose how this vault unlocks.",
  unlockDate: "Choose a future unlock date.",
  cooldownDays: "Choose a cooldown between 1 and 365 days.",
  guardianAddress: "Enter a valid guardian wallet address.",
  guardianNotOwner: "Choose a guardian wallet that is different from the owner wallet.",
};

export const createCreateVaultSchema = (
  messages: CreateVaultValidationMessages = defaultCreateVaultValidationMessages,
) =>
  z
    .object({
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
      ruleType: z.enum(["timeLock", "cooldownUnlock", "guardianApproval"]),
      unlockDate: z.string().trim(),
      cooldownDays: z.string().trim(),
      guardianAddress: z.string().trim(),
    })
    .superRefine((value, context) => {
      if (value.ruleType === "timeLock") {
        if (!isFutureDate(value.unlockDate)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["unlockDate"],
            message: messages.unlockDate,
          });
        }
      }

      if (value.ruleType === "cooldownUnlock") {
        const cooldownDays = Number.parseInt(value.cooldownDays, 10);

        if (!Number.isFinite(cooldownDays) || cooldownDays < 1 || cooldownDays > 365) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["cooldownDays"],
            message: messages.cooldownDays,
          });
        }
      }

      if (value.ruleType === "guardianApproval") {
        if (!isAddress(value.guardianAddress as `0x${string}`)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["guardianAddress"],
            message: messages.guardianAddress,
          });
        }
      }
    });

export const createVaultSchema = createCreateVaultSchema();
