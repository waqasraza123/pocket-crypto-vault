import { z } from "zod";

import { isPositiveAmount } from "./amount";
import { isFutureDate } from "./date";

export const createVaultSchema = z.object({
  goalName: z.string().trim().min(2, "Add a clear goal name.").max(48, "Keep the name concise."),
  note: z.string().trim().max(160, "Keep the note under 160 characters."),
  targetAmount: z
    .string()
    .trim()
    .refine(isPositiveAmount, "Enter a target amount greater than 0."),
  unlockDate: z.string().trim().refine(isFutureDate, "Choose a future unlock date."),
});
