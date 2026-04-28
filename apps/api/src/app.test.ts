import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createApiPersistenceRuntimeCapabilities, type ApiRuntimeEnv } from "./env";
import { buildApp } from "./app";
import { AnalyticsStore } from "./lib/observability/analytics";
import type { IndexerContext } from "./modules/indexer/context";
import { IndexerStore } from "./modules/indexer/indexer-store";
import { internalAccessHeaderName } from "./lib/security/internal-access";
import { SupportStore } from "./modules/support/support-store";

const createEnv = ({
  dataDir,
  internalToken,
}: {
  dataDir: string;
  internalToken: string | null;
}): ApiRuntimeEnv => ({
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
  internalToken,
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

test("internal indexer routes require the configured token", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "pocket-vault-api-app-test-"));

  try {
    const store = new IndexerStore(dataDir);
    await store.initialize();

    const env = createEnv({
      dataDir,
      internalToken: "phase16-token",
    });
    const context: IndexerContext = {
      env,
      store,
      analyticsStore: new AnalyticsStore(dataDir),
      supportStore: {
        create: async () => {},
        list: async () => [],
        get: async () => null,
        updateStatus: async () => null,
      },
      clients: {},
      logger: null,
      close: async () => {
        await store.close();
      },
    };
    const app = buildApp({
      context,
      env,
    });

    const unauthorized = await app.inject({
      method: "POST",
      url: "/internal/indexer/sync",
      payload: {
        mode: "all",
      },
    });
    const authorized = await app.inject({
      method: "POST",
      url: "/internal/indexer/sync",
      headers: {
        [internalAccessHeaderName]: "phase16-token",
      },
      payload: {
        mode: "all",
      },
    });

    assert.equal(unauthorized.statusCode, 401);
    assert.equal(authorized.statusCode, 200);

    await app.close();
  } finally {
    await rm(dataDir, {
      force: true,
      recursive: true,
    });
  }
});

test("vault metadata route rejects invalid and unsigned requests", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "pocket-vault-api-metadata-route-test-"));

  try {
    const store = new IndexerStore(dataDir);
    await store.initialize();

    const env = createEnv({
      dataDir,
      internalToken: null,
    });
    const context: IndexerContext = {
      env,
      store,
      analyticsStore: new AnalyticsStore(dataDir),
      supportStore: {
        create: async () => {},
        list: async () => [],
        get: async () => null,
        updateStatus: async () => null,
      },
      clients: {
        84532: {} as never,
      },
      logger: null,
      close: async () => {
        await store.close();
      },
    };
    const app = buildApp({
      context,
      env,
    });

    const invalid = await app.inject({
      method: "POST",
      url: "/vaults",
      payload: {
        metadata: {
          contractAddress: "invalid",
          chainId: 84532,
        },
      },
    });
    const unsigned = await app.inject({
      method: "POST",
      url: "/vaults",
      payload: {
        metadata: {
          contractAddress: "0x7777777777777777777777777777777777777777",
          chainId: 84532,
          ownerWallet: "0x1111111111111111111111111111111111111111",
          createdTxHash: "0x9999999999999999999999999999999999999999999999999999999999999999",
          displayName: "Emergency Reserve",
          category: null,
          note: null,
          accentTheme: "sage",
          targetAmount: "5000",
          ruleType: "cooldownUnlock",
          unlockDate: null,
          cooldownDurationSeconds: 604800,
          guardianAddress: null,
        },
        auth: {
          issuedAt: new Date().toISOString(),
          signature: "0xdeadbeef",
        },
      },
    });

    assert.equal(invalid.statusCode, 400);
    assert.equal(unsigned.statusCode, 401);

    await app.close();
  } finally {
    await rm(dataDir, {
      force: true,
      recursive: true,
    });
  }
});

test("support intake stores requests and internal triage updates status", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "pocket-vault-api-support-route-test-"));

  try {
    const store = new IndexerStore(dataDir);
    await store.initialize();
    const supportStore = new SupportStore(dataDir);
    await supportStore.initialize();

    const env = createEnv({
      dataDir,
      internalToken: "support-token",
    });
    const context: IndexerContext = {
      env,
      store,
      analyticsStore: new AnalyticsStore(dataDir),
      supportStore,
      clients: {},
      logger: null,
      close: async () => {
        await Promise.all([store.close(), supportStore.close()]);
      },
    };
    const app = buildApp({
      context,
      env,
    });

    const created = await app.inject({
      method: "POST",
      url: "/support/requests",
      headers: {
        "user-agent": "pocket-vault-test",
      },
      payload: {
        category: "transaction",
        priority: "normal",
        subject: "Deposit confirmation lag",
        message: "My staging deposit confirmed but the vault activity has not refreshed after several minutes.",
        reporterWallet: "0x1111111111111111111111111111111111111111",
        contactEmail: null,
        context: {
          route: "/vaults/0x2222222222222222222222222222222222222222",
          environment: "development",
          deploymentTarget: "local",
          chainId: 84532,
          walletStatus: "ready",
          vaultAddress: "0x2222222222222222222222222222222222222222",
        },
      },
    });

    assert.equal(created.statusCode, 201);
    const createdBody = created.json();
    assert.equal(createdBody.status, "open");

    const listed = await app.inject({
      method: "GET",
      url: "/internal/support/requests?status=open",
      headers: {
        [internalAccessHeaderName]: "support-token",
      },
    });

    assert.equal(listed.statusCode, 200);
    assert.equal(listed.json().items.length, 1);
    assert.equal(listed.json().items[0].subject, "Deposit confirmation lag");

    const updated = await app.inject({
      method: "PATCH",
      url: `/internal/support/requests/${createdBody.id}`,
      headers: {
        [internalAccessHeaderName]: "support-token",
      },
      payload: {
        status: "triage",
      },
    });

    assert.equal(updated.statusCode, 200);
    assert.equal(updated.json().item.status, "triage");

    await app.close();
  } finally {
    await rm(dataDir, {
      force: true,
      recursive: true,
    });
  }
});
