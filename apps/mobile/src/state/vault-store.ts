import { useSyncExternalStore } from "react";

import type {
  MetadataSaveResult,
  SupportedChainId,
  VaultActivityEvent,
  VaultAddress,
  VaultMetadataPayload,
  VaultMetadataRecord,
} from "@goal-vault/shared";
import type { Address, Hash } from "viem";

interface SessionVaultInput extends VaultMetadataPayload {
  txHash: Hash;
  accentTone: string;
}

type VaultStoreSnapshot = {
  version: number;
  metadataByVaultKey: Record<string, VaultMetadataRecord>;
  activityByEventId: Record<string, SessionVaultActivityRecord>;
};

type SessionVaultActivityRecord = VaultActivityEvent & {
  chainId: SupportedChainId;
  ownerAddress: Address;
  source: "session";
};

let snapshot: VaultStoreSnapshot = {
  version: 0,
  metadataByVaultKey: {},
  activityByEventId: {},
};

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const createVaultKey = (chainId: SupportedChainId, vaultAddress: VaultAddress) =>
  `${chainId}:${vaultAddress.toLowerCase()}`;

const emitChange = () => {
  snapshot = {
    ...snapshot,
    version: snapshot.version + 1,
  };

  listeners.forEach((listener) => listener());
};

export const useVaultStoreVersion = () => useSyncExternalStore(subscribe, () => snapshot.version, () => snapshot.version);

export const invalidateVaultQueries = () => {
  emitChange();
};

export const upsertSessionVaultMetadata = ({
  contractAddress,
  chainId,
  ownerWallet,
  displayName,
  category,
  note,
  accentTheme,
  targetAmount,
  unlockDate,
  txHash,
  accentTone,
}: SessionVaultInput) => {
  snapshot = {
    ...snapshot,
    metadataByVaultKey: {
      ...snapshot.metadataByVaultKey,
      [createVaultKey(chainId, contractAddress)]: {
        contractAddress,
        chainId,
        ownerWallet,
        displayName,
        category,
        note,
        accentTheme,
        targetAmount,
        unlockDate,
        txHash,
        accentTone,
        metadataStatus: "pending",
        createdAt: new Date().toISOString(),
      },
    },
  };

  emitChange();
};

export const markSessionVaultMetadata = ({
  chainId,
  vaultAddress,
  status,
}: {
  chainId: SupportedChainId;
  vaultAddress: VaultAddress;
  status: MetadataSaveResult["status"];
}) => {
  const key = createVaultKey(chainId, vaultAddress);
  const current = snapshot.metadataByVaultKey[key];

  if (!current) {
    return;
  }

  snapshot = {
    ...snapshot,
    metadataByVaultKey: {
      ...snapshot.metadataByVaultKey,
      [key]: {
        ...current,
        metadataStatus: status === "saved" ? "saved" : "failed",
      },
    },
  };

  emitChange();
};

export const getSessionVaultMetadata = ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: VaultAddress;
}): VaultMetadataRecord | null => snapshot.metadataByVaultKey[createVaultKey(chainId, vaultAddress)] ?? null;

export const getSessionVaultsByOwner = ({
  chainId,
  ownerWallet,
}: {
  chainId: SupportedChainId;
  ownerWallet: Address;
}): VaultMetadataRecord[] =>
  Object.values(snapshot.metadataByVaultKey)
    .filter((record) => record.chainId === chainId && record.ownerWallet.toLowerCase() === ownerWallet.toLowerCase())
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));

export const upsertSessionVaultActivity = ({
  chainId,
  ownerAddress,
  event,
}: {
  chainId: SupportedChainId;
  ownerAddress: Address;
  event: VaultActivityEvent;
}) => {
  snapshot = {
    ...snapshot,
    activityByEventId: {
      ...snapshot.activityByEventId,
      [event.id]: {
        ...event,
        chainId,
        ownerAddress,
        source: "session",
      },
    },
  };

  emitChange();
};

export const getSessionVaultActivities = ({
  chainId,
  ownerAddress,
  vaultAddress,
}: {
  chainId?: SupportedChainId;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
} = {}): SessionVaultActivityRecord[] =>
  Object.values(snapshot.activityByEventId)
    .filter((event) => {
      if (chainId && event.chainId !== chainId) {
        return false;
      }

      if (ownerAddress && event.ownerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        return false;
      }

      if (vaultAddress && event.vaultAddress.toLowerCase() !== vaultAddress.toLowerCase()) {
        return false;
      }

      return true;
    })
    .sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1));
