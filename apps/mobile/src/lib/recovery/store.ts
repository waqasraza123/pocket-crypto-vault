import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";

import type { TransactionRecoveryRecord } from "@pocket-vault/shared";

const storageKey = "@pocket-vault/transaction-recovery";

interface RecoveryStoreSnapshot {
  version: number;
  hydrated: boolean;
  records: Record<string, TransactionRecoveryRecord>;
}

let snapshot: RecoveryStoreSnapshot = {
  version: 0,
  hydrated: false,
  records: {},
};

const listeners = new Set<() => void>();
let hydratePromise: Promise<void> | null = null;

const emitChange = () => {
  snapshot = {
    ...snapshot,
    version: snapshot.version + 1,
  };
  listeners.forEach((listener) => listener());
};

const persist = async () => {
  await AsyncStorage.setItem(storageKey, JSON.stringify(Object.values(snapshot.records)));
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const hydrateTransactionRecoveryStore = async () => {
  if (snapshot.hydrated) {
    return;
  }

  if (!hydratePromise) {
    hydratePromise = (async () => {
      const raw = await AsyncStorage.getItem(storageKey);
      const items = raw ? (JSON.parse(raw) as TransactionRecoveryRecord[]) : [];
      snapshot = {
        version: snapshot.version,
        hydrated: true,
        records: Object.fromEntries(items.map((item) => [item.id, item])),
      };
      emitChange();
    })().finally(() => {
      hydratePromise = null;
    });
  }

  await hydratePromise;
};

export const useTransactionRecoveryStoreVersion = () =>
  useSyncExternalStore(subscribe, () => snapshot.version, () => snapshot.version);

export const useHydrateTransactionRecoveryStore = () => {
  useEffect(() => {
    void hydrateTransactionRecoveryStore();
  }, []);
};

export const getTransactionRecoveryRecords = () => Object.values(snapshot.records).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

export const upsertTransactionRecoveryRecord = async (record: TransactionRecoveryRecord) => {
  snapshot = {
    ...snapshot,
    records: {
      ...snapshot.records,
      [record.id]: record,
    },
  };
  emitChange();
  await persist();
};

export const updateTransactionRecoveryRecord = async (
  id: string,
  updater: (current: TransactionRecoveryRecord) => TransactionRecoveryRecord,
) => {
  const current = snapshot.records[id];

  if (!current) {
    return;
  }

  snapshot = {
    ...snapshot,
    records: {
      ...snapshot.records,
      [id]: updater(current),
    },
  };
  emitChange();
  await persist();
};

export const removeTransactionRecoveryRecord = async (id: string) => {
  if (!snapshot.records[id]) {
    return;
  }

  const nextRecords = { ...snapshot.records };
  delete nextRecords[id];
  snapshot = {
    ...snapshot,
    records: nextRecords,
  };
  emitChange();
  await persist();
};
