import { useSyncExternalStore } from "react";

import type {
  MetadataSaveResult,
  PostTransactionRefreshState,
  SupportedChainId,
  VaultActivityEvent,
  VaultAddress,
  VaultMetadataPayload,
  VaultMetadataRecord,
} from "@pocket-vault/shared";
import type { Address } from "viem";

interface SessionVaultInput extends VaultMetadataPayload {
  accentTone: string;
}

type VaultStoreSnapshot = {
  version: number;
  metadataByVaultKey: Record<string, VaultMetadataRecord>;
  activityByEventId: Record<string, SessionVaultActivityRecord>;
  refreshByScopeKey: Record<string, ActiveRefreshRecord>;
};

type SessionVaultActivityRecord = VaultActivityEvent & {
  chainId: SupportedChainId;
  ownerAddress: Address;
  source: "session";
};

type ActiveRefreshRecord = PostTransactionRefreshState;

let snapshot: VaultStoreSnapshot = {
  version: 0,
  metadataByVaultKey: {},
  activityByEventId: {},
  refreshByScopeKey: {},
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

const createRefreshScopeKey = ({
  chainId,
  ownerAddress,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
}) => `${chainId}:${ownerAddress?.toLowerCase() ?? "unknown"}:${vaultAddress?.toLowerCase() ?? "all"}`;

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
  ruleType,
  unlockDate,
  cooldownDurationSeconds,
  guardianAddress,
  createdTxHash,
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
        createdTxHash,
        displayName,
        category,
        note,
        accentTheme,
        targetAmount,
        ruleType,
        unlockDate,
        cooldownDurationSeconds,
        guardianAddress,
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

export const startPostTransactionRefresh = ({
  chainId,
  ownerAddress,
  vaultAddress,
  flow,
  txHash,
}: Omit<PostTransactionRefreshState, "startedAt" | "status" | "updatedAt">) => {
  const now = new Date().toISOString();
  const scopeKey = createRefreshScopeKey({
    chainId,
    ownerAddress,
    vaultAddress,
  });

  snapshot = {
    ...snapshot,
    refreshByScopeKey: {
      ...snapshot.refreshByScopeKey,
      [scopeKey]: {
        status: "refreshing",
        chainId,
        ownerAddress,
        vaultAddress,
        flow,
        txHash,
        startedAt: now,
        updatedAt: now,
      },
    },
  };

  emitChange();
};

export const advancePostTransactionRefresh = ({
  chainId,
  ownerAddress,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
}) => {
  const scopeKey = createRefreshScopeKey({
    chainId,
    ownerAddress,
    vaultAddress,
  });
  const current = snapshot.refreshByScopeKey[scopeKey];

  if (!current) {
    return;
  }

  snapshot = {
    ...snapshot,
    refreshByScopeKey: {
      ...snapshot.refreshByScopeKey,
      [scopeKey]: {
        ...current,
        status: "catching_up",
        updatedAt: new Date().toISOString(),
      },
    },
  };

  emitChange();
};

export const completePostTransactionRefresh = ({
  chainId,
  ownerAddress,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
}) => {
  const scopeKey = createRefreshScopeKey({
    chainId,
    ownerAddress,
    vaultAddress,
  });
  const nextRefreshByScopeKey = {
    ...snapshot.refreshByScopeKey,
  };

  delete nextRefreshByScopeKey[scopeKey];
  snapshot = {
    ...snapshot,
    refreshByScopeKey: nextRefreshByScopeKey,
  };

  emitChange();
};

export const getPostTransactionRefreshState = ({
  chainId,
  ownerAddress,
  vaultAddress,
}: {
  chainId?: SupportedChainId | null;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
} = {}): PostTransactionRefreshState | null => {
  const matches = Object.values(snapshot.refreshByScopeKey).filter((record) => {
    if (chainId && record.chainId !== chainId) {
      return false;
    }

    if (ownerAddress && record.ownerAddress?.toLowerCase() !== ownerAddress.toLowerCase()) {
      return false;
    }

    if (vaultAddress && record.vaultAddress?.toLowerCase() !== vaultAddress.toLowerCase()) {
      return false;
    }

    return true;
  });

  return matches.sort((left, right) => (left.updatedAt ?? "") < (right.updatedAt ?? "") ? 1 : -1)[0] ?? null;
};
