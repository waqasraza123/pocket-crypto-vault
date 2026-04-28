import type { VaultMetadataWriteRequest } from "@pocket-vault/shared";
import * as metadataAuthModule from "@pocket-vault/shared/src/validation/metadataAuth";
import { parseUnits, verifyMessage, type Address, type Log } from "viem";

import { readGoalVaultSummaryForIndexer } from "../../lib/contracts";
import type { IndexerContext } from "../indexer/context";
import { getRuleStatePatchFromSummary, normalizeVaultCreatedLogs } from "../indexer/event-normalizer";
import type { PersistedVaultRecord } from "../persistence/ports";
import { mergeVaultRecord } from "../indexer/reconciliation.service";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const metadataAuthExports = metadataAuthModule as typeof metadataAuthModule & {
  default?: {
    buildVaultMetadataAuthorizationMessage?: typeof metadataAuthModule.buildVaultMetadataAuthorizationMessage;
  };
};
const buildVaultMetadataAuthorizationMessage =
  metadataAuthExports.buildVaultMetadataAuthorizationMessage ??
  metadataAuthExports.default?.buildVaultMetadataAuthorizationMessage;

type VerificationFailureCode = "invalid" | "unauthorized" | "unavailable";

interface VerificationFailure {
  status: "rejected";
  code: VerificationFailureCode;
  message: string;
}

interface VerificationSuccess {
  status: "verified";
  record: PersistedVaultRecord;
}

type VaultMetadataVerificationResult = VerificationFailure | VerificationSuccess;

const getRuleType = (value: bigint | number) => {
  if (value === 1 || value === 1n) {
    return "cooldownUnlock" as const;
  }

  if (value === 2 || value === 2n) {
    return "guardianApproval" as const;
  }

  return "timeLock" as const;
};

const normalizeAddress = (value: Address | null | undefined) => (value ?? zeroAddress).toLowerCase();

const normalizeTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    return NaN;
  }

  return Math.floor(parsed / 1000);
};

const isSignatureFresh = ({
  issuedAt,
  maxAgeSeconds,
}: {
  issuedAt: string;
  maxAgeSeconds: number;
}) => {
  const signedAt = Date.parse(issuedAt);

  if (Number.isNaN(signedAt)) {
    return false;
  }

  const deltaMs = Date.now() - signedAt;

  return deltaMs >= -60_000 && deltaMs <= maxAgeSeconds * 1000;
};

const buildVerifiedVaultRecord = ({
  current,
  createdVault,
  summary,
}: {
  current: PersistedVaultRecord | null;
  createdVault: PersistedVaultRecord;
  summary: Awaited<ReturnType<typeof readGoalVaultSummaryForIndexer>>;
}) =>
  mergeVaultRecord({
    current,
    patch: {
      chainId: createdVault.chainId,
      contractAddress: createdVault.contractAddress,
      ownerWallet: summary.owner,
      assetAddress: summary.asset,
      targetAmountAtomic: summary.targetAmount.toString(),
      createdAt: createdVault.createdAt,
      createdTxHash: createdVault.createdTxHash,
      totalDepositedAtomic: summary.totalDeposited.toString(),
      totalWithdrawnAtomic: summary.totalWithdrawn.toString(),
      currentBalanceAtomic: summary.currentBalance.toString(),
      lastActivityAt: current?.lastActivityAt ?? createdVault.lastActivityAt ?? createdVault.createdAt,
      lastIndexedAt: new Date().toISOString(),
      onchainFound: true,
      ...getRuleStatePatchFromSummary({
        summary: {
          ruleType: summary.ruleType,
          unlockAt: summary.unlockAt,
          cooldownDuration: summary.cooldownDuration,
          guardian: summary.guardian,
          unlockRequestedAt: summary.unlockRequestedAt,
          guardianDecision: summary.guardianDecision,
          guardianDecisionAt: summary.guardianDecisionAt,
          unlockEligibleAt: summary.unlockEligibleAt,
        },
      }),
    },
  });

export const verifyVaultMetadataWriteRequest = async ({
  context,
  request,
}: {
  context: IndexerContext;
  request: VaultMetadataWriteRequest;
}): Promise<VaultMetadataVerificationResult> => {
  const { auth, metadata } = request;
  const client = context.clients[metadata.chainId];

  if (!client) {
    return {
      status: "rejected",
      code: "unavailable",
      message: "Vault verification is unavailable for this chain right now.",
    };
  }

  if (
    !isSignatureFresh({
      issuedAt: auth.issuedAt,
      maxAgeSeconds: context.env.signedRequestMaxAgeSeconds,
    })
  ) {
    return {
      status: "rejected",
      code: "unauthorized",
      message: "Vault authorization expired. Sign the request again.",
    };
  }

  let isAuthorized = false;

  try {
    isAuthorized = await verifyMessage({
      address: metadata.ownerWallet,
      message: buildVaultMetadataAuthorizationMessage({
        metadata,
        issuedAt: auth.issuedAt,
      }),
      signature: auth.signature,
    });
  } catch {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    return {
      status: "rejected",
      code: "unauthorized",
      message: "Vault authorization could not be verified.",
    };
  }

  const [receipt, transaction] = await Promise.all([
    client.getTransactionReceipt({
      hash: metadata.createdTxHash,
    }),
    client.getTransaction({
      hash: metadata.createdTxHash,
    }),
  ]);

  if (receipt.status !== "success") {
    return {
      status: "rejected",
      code: "invalid",
      message: "The vault creation transaction has not been confirmed successfully.",
    };
  }

  if (transaction.from.toLowerCase() !== metadata.ownerWallet.toLowerCase()) {
    return {
      status: "rejected",
      code: "unauthorized",
      message: "The signed wallet does not match the vault owner.",
    };
  }

  const currentVault = await context.store.getVault(metadata.chainId, metadata.contractAddress);
  const normalized = normalizeVaultCreatedLogs({
    chainId: metadata.chainId,
    logs: receipt.logs as Log[],
    currentVaults: new Map(
      currentVault ? [[currentVault.contractAddress.toLowerCase(), currentVault] as const] : [],
    ),
  });
  const created = normalized.find(
    (item) =>
      item.vault.contractAddress.toLowerCase() === metadata.contractAddress.toLowerCase() &&
      item.event.txHash.toLowerCase() === metadata.createdTxHash.toLowerCase(),
  );

  if (!created || !created.vault.ownerWallet) {
    return {
      status: "rejected",
      code: "invalid",
      message: "The vault creation receipt did not match this metadata request.",
    };
  }

  if (created.vault.ownerWallet.toLowerCase() !== metadata.ownerWallet.toLowerCase()) {
    return {
      status: "rejected",
      code: "unauthorized",
      message: "The signed wallet does not own this vault.",
    };
  }

  const summary = await readGoalVaultSummaryForIndexer({
    client: client as Parameters<typeof readGoalVaultSummaryForIndexer>[0]["client"],
    vaultAddress: metadata.contractAddress,
  });
  const targetAmountAtomic = parseUnits(metadata.targetAmount.replaceAll(",", "").trim(), 6).toString();

  if (summary.targetAmount.toString() !== targetAmountAtomic) {
    return {
      status: "rejected",
      code: "invalid",
      message: "The submitted target amount does not match the onchain vault.",
    };
  }

  const onchainRuleType = getRuleType(summary.ruleType);

  if (onchainRuleType !== metadata.ruleType) {
    return {
      status: "rejected",
      code: "invalid",
      message: "The submitted vault rule does not match the onchain vault.",
    };
  }

  if (
    metadata.ruleType === "timeLock" &&
    normalizeTimestamp(metadata.unlockDate) !== Number(summary.unlockAt)
  ) {
    return {
      status: "rejected",
      code: "invalid",
      message: "The submitted unlock date does not match the onchain vault.",
    };
  }

  if (
    metadata.ruleType === "cooldownUnlock" &&
    (metadata.cooldownDurationSeconds ?? 0) !== Number(summary.cooldownDuration)
  ) {
    return {
      status: "rejected",
      code: "invalid",
      message: "The submitted cooldown does not match the onchain vault.",
    };
  }

  if (
    metadata.ruleType === "guardianApproval" &&
    normalizeAddress(metadata.guardianAddress ?? null) !== normalizeAddress(summary.guardian)
  ) {
    return {
      status: "rejected",
      code: "invalid",
      message: "The submitted guardian does not match the onchain vault.",
    };
  }

  if (currentVault?.ownerWallet && currentVault.ownerWallet.toLowerCase() !== metadata.ownerWallet.toLowerCase()) {
    return {
      status: "rejected",
      code: "unauthorized",
      message: "Stored vault ownership does not match this request.",
    };
  }

  if (
    currentVault?.createdTxHash &&
    currentVault.createdTxHash.toLowerCase() !== metadata.createdTxHash.toLowerCase()
  ) {
    return {
      status: "rejected",
      code: "invalid",
      message: "Stored vault creation data does not match this request.",
    };
  }

  await context.store.upsertEvent(created.event);

  const record = buildVerifiedVaultRecord({
    current: currentVault,
    createdVault: created.vault,
    summary,
  });

  await context.store.upsertVault(record);

  return {
    status: "verified",
    record,
  };
};
