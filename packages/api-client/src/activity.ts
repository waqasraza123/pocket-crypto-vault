import { ActivityFeedResponseSchema, VaultActivityResponseSchema } from "./schemas";

export const parseActivityFeedPayload = (payload: unknown) => ActivityFeedResponseSchema.parse(payload);

export const parseVaultActivityPayload = (payload: unknown) => VaultActivityResponseSchema.parse(payload);
