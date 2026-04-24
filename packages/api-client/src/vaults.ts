import { VaultDetailResponseSchema, VaultListResponseSchema, VaultMetadataSaveResponseSchema } from "./schemas";

export const parseVaultListPayload = (payload: unknown) => VaultListResponseSchema.parse(payload);

export const parseVaultDetailPayload = (payload: unknown) => VaultDetailResponseSchema.parse(payload);

export const parseVaultMetadataSavePayload = (payload: unknown) => VaultMetadataSaveResponseSchema.parse(payload);
