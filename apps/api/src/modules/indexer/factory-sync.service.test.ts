import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createApiPersistenceRuntimeCapabilities, type ApiRuntimeEnv } from "../../env";
import { goalVaultFactoryAbi } from "../../lib/contracts";
import { AnalyticsStore } from "../../lib/observability/analytics";
import type { IndexerContext } from "./context";
import { syncFactoryEventsForChain } from "./factory-sync.service";
import { IndexerStore } from "./indexer-store";
import { createTestLog } from "../../test/logs";

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

test("syncFactoryEventsForChain ingests legacy and V2 creation events without duplicates", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "goal-vault-api-factory-sync-"));

  try {
    const store = new IndexerStore(dataDir);
    await store.initialize();

    const factoryAddress = "0xfA00000000000000000000000000000000000032";
    const owner = "0x1111111111111111111111111111111111111111";
    const asset = "0x2222222222222222222222222222222222222222";
    const timeLockVault = "0x3333333333333333333333333333333333333333";
    const cooldownVault = "0x4444444444444444444444444444444444444444";
    const guardianVault = "0x5555555555555555555555555555555555555555";
    const guardian = "0x6666666666666666666666666666666666666666";

    const rawLogs = [
      createTestLog({
        abi: goalVaultFactoryAbi,
        address: factoryAddress,
        eventName: "VaultCreated",
        args: {
          owner,
          vault: timeLockVault,
          asset,
          targetAmount: 1_000_000_000n,
          unlockAt: 1_800_000_000n,
          createdAt: 1_700_000_000n,
        },
        blockNumber: 10,
        logIndex: 0,
        txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      }),
      createTestLog({
        abi: goalVaultFactoryAbi,
        address: factoryAddress,
        eventName: "VaultCreatedV2",
        args: {
          owner,
          vault: timeLockVault,
          asset,
          targetAmount: 1_000_000_000n,
          ruleType: 0,
          unlockAt: 1_800_000_000n,
          cooldownDuration: 0,
          guardian: "0x0000000000000000000000000000000000000000",
          createdAt: 1_700_000_000n,
        },
        blockNumber: 10,
        logIndex: 1,
        txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      }),
      createTestLog({
        abi: goalVaultFactoryAbi,
        address: factoryAddress,
        eventName: "VaultCreatedV2",
        args: {
          owner,
          vault: cooldownVault,
          asset,
          targetAmount: 2_500_000_000n,
          ruleType: 1,
          unlockAt: 0,
          cooldownDuration: 604800,
          guardian: "0x0000000000000000000000000000000000000000",
          createdAt: 1_700_000_100n,
        },
        blockNumber: 11,
        logIndex: 0,
        txHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      }),
      createTestLog({
        abi: goalVaultFactoryAbi,
        address: factoryAddress,
        eventName: "VaultCreatedV2",
        args: {
          owner,
          vault: guardianVault,
          asset,
          targetAmount: 3_000_000_000n,
          ruleType: 2,
          unlockAt: 0,
          cooldownDuration: 0,
          guardian,
          createdAt: 1_700_000_200n,
        },
        blockNumber: 12,
        logIndex: 0,
        txHash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      }),
    ];

    const context: IndexerContext = {
      env: createEnv(dataDir),
      store,
      analyticsStore: new AnalyticsStore(dataDir),
      clients: {
        84532: {
          getBlockNumber: async () => 25n,
          getLogs: async () => rawLogs,
        } as never,
      },
      logger: null,
      close: async () => {
        await store.close();
      },
    };

    await syncFactoryEventsForChain(context, 84532);

    const firstPassVaults = (await store.listVaults()).sort((left, right) => left.contractAddress.localeCompare(right.contractAddress));
    const firstPassEvents = await store.listEvents();

    assert.equal(firstPassVaults.length, 3);
    assert.equal(firstPassEvents.length, 3);
    assert.deepEqual(
      firstPassVaults.map((vault) => [vault.contractAddress, vault.ruleType, vault.createdTxHash]),
      [
        [timeLockVault, "timeLock", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
        [cooldownVault, "cooldownUnlock", "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"],
        [guardianVault, "guardianApproval", "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"],
      ],
    );
    assert.equal(firstPassVaults[1].cooldownDurationSeconds, 604800);
    assert.equal(firstPassVaults[2].guardianAddress, guardian);

    await syncFactoryEventsForChain(context, 84532);

    const secondPassVaults = await store.listVaults();
    const secondPassEvents = await store.listEvents();

    assert.equal(secondPassVaults.length, 3);
    assert.equal(secondPassEvents.length, 3);
    assert.equal((await store.getSyncState("factory:84532"))?.latestIndexedBlock, 12);
  } finally {
    await rm(dataDir, {
      force: true,
      recursive: true,
    });
  }
});
