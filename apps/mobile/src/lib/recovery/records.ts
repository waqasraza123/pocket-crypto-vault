import type { TransactionRecoveryRecord } from "@pocket-vault/shared";

import { getTransactionRecoveryCopy } from "./copy";

export const createRecoveryId = ({ kind, txHash }: Pick<TransactionRecoveryRecord, "kind" | "txHash">) =>
  `${kind}:${String(txHash).toLowerCase()}`;

export const buildTransactionRecoveryRecord = ({
  action,
  amountAtomic = null,
  chainId,
  kind,
  metadata = null,
  ownerAddress,
  status,
  txHash,
  vaultAddress = null,
}: {
  action: TransactionRecoveryRecord["action"];
  amountAtomic?: TransactionRecoveryRecord["amountAtomic"];
  chainId: TransactionRecoveryRecord["chainId"];
  kind: TransactionRecoveryRecord["kind"];
  metadata?: TransactionRecoveryRecord["metadata"];
  ownerAddress: TransactionRecoveryRecord["ownerAddress"];
  status: TransactionRecoveryRecord["status"];
  txHash: TransactionRecoveryRecord["txHash"];
  vaultAddress?: TransactionRecoveryRecord["vaultAddress"];
}): TransactionRecoveryRecord => {
  const copy = getTransactionRecoveryCopy({
    kind,
    status,
  });
  const timestamp = new Date().toISOString();

  return {
    id: createRecoveryId({ kind, txHash }),
    kind,
    chainId,
    ownerAddress,
    vaultAddress,
    txHash,
    amountAtomic,
    status,
    syncStatus: status === "confirmed" || status === "syncing" ? "pending" : "idle",
    title: copy.title,
    description: copy.description,
    action,
    didConfirmOnchain: status === "confirmed" || status === "syncing" || status === "completed",
    message: null,
    metadata,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};
