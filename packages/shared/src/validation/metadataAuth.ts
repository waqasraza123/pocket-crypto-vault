import type { VaultMetadataPayload } from "../domain/vault";

const normalizeValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const buildVaultMetadataAuthorizationMessage = ({
  metadata,
  issuedAt,
}: {
  metadata: VaultMetadataPayload;
  issuedAt: string;
}) =>
  [
    "Pocket Vault metadata authorization",
    "version:1",
    `chainId:${metadata.chainId}`,
    `contractAddress:${normalizeValue(metadata.contractAddress).toLowerCase()}`,
    `ownerWallet:${normalizeValue(metadata.ownerWallet).toLowerCase()}`,
    `createdTxHash:${normalizeValue(metadata.createdTxHash).toLowerCase()}`,
    `displayName:${normalizeValue(metadata.displayName)}`,
    `category:${normalizeValue(metadata.category)}`,
    `note:${normalizeValue(metadata.note)}`,
    `accentTheme:${normalizeValue(metadata.accentTheme)}`,
    `targetAmount:${normalizeValue(metadata.targetAmount)}`,
    `ruleType:${normalizeValue(metadata.ruleType)}`,
    `unlockDate:${normalizeValue(metadata.unlockDate)}`,
    `cooldownDurationSeconds:${normalizeValue(metadata.cooldownDurationSeconds)}`,
    `guardianAddress:${normalizeValue(metadata.guardianAddress).toLowerCase()}`,
    `issuedAt:${normalizeValue(issuedAt)}`,
  ].join("\n");
