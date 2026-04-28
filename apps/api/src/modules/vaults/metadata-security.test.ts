import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import type { VaultMetadataWriteRequest } from "@pocket-vault/shared";
import * as metadataAuthModule from "@pocket-vault/shared/src/validation/metadataAuth";
import { privateKeyToAccount } from "viem/accounts";

import { createApiPersistenceRuntimeCapabilities, type ApiRuntimeEnv } from "../../env";
import { goalVaultFactoryAbi } from "../../lib/contracts";
import { AnalyticsStore } from "../../lib/observability/analytics";
import type { IndexerContext } from "../indexer/context";
import { IndexerStore } from "../indexer/indexer-store";
import { verifyVaultMetadataWriteRequest } from "./metadata-security";
import { createTestLog } from "../../test/logs";

const metadataAuthExports = metadataAuthModule as typeof metadataAuthModule & {
  default?: {
    buildVaultMetadataAuthorizationMessage?: typeof metadataAuthModule.buildVaultMetadataAuthorizationMessage;
  };
};
const buildVaultMetadataAuthorizationMessage =
  metadataAuthExports.buildVaultMetadataAuthorizationMessage ??
  metadataAuthExports.default?.buildVaultMetadataAuthorizationMessage;

const createEnv = (dataDir: string): ApiRuntimeEnv => ({
  environment: "development",
  deploymentTarget: "local",
  host: "127.0.0.1",
  port: 3001,
  version: "test",
  publicBaseUrl: null,
  dataDir,
  persistence: {
    driver: "sqlite",
    postgresqlDriver: "pg",
    sqliteDataDir: dataDir,
    postgresUrlConfigured: false,
    schemaName: "goal_vault_api",
    capabilities: createApiPersistenceRuntimeCapabilities(),
    runtimeReady: true,
    message: "SQLite persistence is active.",
  },
  syncIntervalMs: 0,
  indexerEnabled: true,
  analyticsEnabled: false,
  supportEnabled: true,
  rollbackEvidenceAccepted: false,
  smokeEvidenceAccepted: false,
  limitedBetaScopeApproved: false,
  internalToken: null,
  signedRequestMaxAgeSeconds: 900,
  logLevel: "info",
  chains: {
    8453: {
      chainId: 8453,
      rpcUrl: null,
      factoryAddress: null,
      startBlock: 0,
    },
    84532: {
      chainId: 84532,
      rpcUrl: "https://example.invalid",
      factoryAddress: "0xfA00000000000000000000000000000000000032",
      startBlock: 0,
    },
  },
  validationErrors: [],
});

test("verifyVaultMetadataWriteRequest validates the signed owner and materializes a cooldown vault", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "pocket-vault-api-metadata-security-"));

  try {
    const store = new IndexerStore(dataDir);
    await store.initialize();

    const account = privateKeyToAccount("0x59c6995e998f97a5a0044966f09453891d8af0d5b6ec5d47b4f7f7557b4b5d23");
    const vaultAddress = "0x7777777777777777777777777777777777777777";
    const assetAddress = "0x8888888888888888888888888888888888888888";
    const createdTxHash = "0x9999999999999999999999999999999999999999999999999999999999999999";
    const receiptLog = createTestLog({
      abi: goalVaultFactoryAbi,
      address: "0xfA00000000000000000000000000000000000032",
      eventName: "VaultCreatedV2",
      args: {
        owner: account.address,
        vault: vaultAddress,
        asset: assetAddress,
        targetAmount: 5_000_000_000n,
        ruleType: 1,
        unlockAt: 0,
        cooldownDuration: 604800,
        guardian: "0x0000000000000000000000000000000000000000",
        createdAt: 1_700_000_000n,
      },
      blockNumber: 40,
      logIndex: 0,
      txHash: createdTxHash,
    });
    const issuedAt = new Date().toISOString();
    const request: VaultMetadataWriteRequest = {
      metadata: {
        contractAddress: vaultAddress,
        chainId: 84532,
        ownerWallet: account.address,
        createdTxHash,
        displayName: "Emergency Reserve",
        category: "Safety",
        note: "Six months of living costs",
        accentTheme: "sage",
        targetAmount: "5000",
        ruleType: "cooldownUnlock",
        unlockDate: null,
        cooldownDurationSeconds: 604800,
        guardianAddress: null,
      },
      auth: {
        issuedAt,
        signature: await account.signMessage({
          message: buildVaultMetadataAuthorizationMessage({
            metadata: {
              contractAddress: vaultAddress,
              chainId: 84532,
              ownerWallet: account.address,
              createdTxHash,
              displayName: "Emergency Reserve",
              category: "Safety",
              note: "Six months of living costs",
              accentTheme: "sage",
              targetAmount: "5000",
              ruleType: "cooldownUnlock",
              unlockDate: null,
              cooldownDurationSeconds: 604800,
              guardianAddress: null,
            },
            issuedAt,
          }),
        }),
      },
    };

    const context: IndexerContext = {
      env: createEnv(dataDir),
      store,
      analyticsStore: new AnalyticsStore(dataDir),
      supportStore: {
        create: async () => {},
        list: async () => [],
        get: async () => null,
        updateStatus: async () => null,
      },
      clients: {
        84532: {
          getTransactionReceipt: async () => ({
            status: "success",
            logs: [receiptLog],
          }),
          getTransaction: async () => ({
            from: account.address,
          }),
          readContract: async ({ functionName }: { functionName: string }) => {
            if (functionName === "getSummary") {
              return [
                account.address,
                assetAddress,
                5_000_000_000n,
                0n,
                0n,
                0n,
                0n,
                false,
              ] as const;
            }

            return [
              1n,
              0n,
              604800n,
              "0x0000000000000000000000000000000000000000",
              0n,
              0n,
              0n,
              0n,
              false,
            ] as const;
          },
        } as never,
      },
      logger: null,
      close: async () => {
        await store.close();
      },
    };

    const result = await verifyVaultMetadataWriteRequest({
      context,
      request,
    });

    assert.equal(result.status, "verified");
    if (result.status !== "verified") {
      throw new Error("Expected metadata verification to succeed.");
    }

    assert.equal(result.record.contractAddress, vaultAddress);
    assert.equal(result.record.ownerWallet, account.address);
    assert.equal(result.record.createdTxHash, createdTxHash);
    assert.equal(result.record.ruleType, "cooldownUnlock");
    assert.equal(result.record.cooldownDurationSeconds, 604800);

    const storedVault = await store.getVault(84532, vaultAddress);
    assert.ok(storedVault);
    assert.equal(storedVault?.displayName, null);
    assert.equal((await store.listEvents()).length, 1);
  } finally {
    await rm(dataDir, {
      force: true,
      recursive: true,
    });
  }
});
