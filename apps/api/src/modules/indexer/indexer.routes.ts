import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { SupportedChainId } from "@goal-vault/shared";

import type { ApiRuntimeEnv } from "../../env";
import { requireInternalRequestAccess } from "../../lib/security/internal-access";
import type { IndexerContext } from "./context";
import { syncFactoryEventsForChain } from "./factory-sync.service";
import { reconcileVaultMetadata } from "./reconciliation.service";
import { getChainSyncStatuses } from "./sync-state.service";
import { syncVaultEventsForChain } from "./vault-sync.service";

const syncRequestSchema = z.object({
  chainId: z.union([z.literal(8453), z.literal(84532)]).optional(),
  mode: z.enum(["all", "factory", "vaults", "reconcile"]).optional(),
});

export const runFullIndexerSync = async (context: IndexerContext, chainId?: SupportedChainId) => {
  const chains = chainId ? [chainId] : ([8453, 84532] as const);

  for (const item of chains) {
    await syncFactoryEventsForChain(context, item);
    await syncVaultEventsForChain(context, item);
  }

  await reconcileVaultMetadata(context);
};

export const registerIndexerRoutes = (app: FastifyInstance, context: IndexerContext, env: ApiRuntimeEnv) => {
  app.get("/internal/indexer/status", async (request, reply) => {
    if (!(await requireInternalRequestAccess({ env, request, reply }))) {
      return;
    }

    return {
      items: getChainSyncStatuses(context),
    };
  });

  app.post("/internal/indexer/sync", async (request, reply) => {
    if (!(await requireInternalRequestAccess({ env, request, reply }))) {
      return;
    }

    const parsed = syncRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid sync request.",
      });
    }

    const { chainId, mode = "all" } = parsed.data;
    const chains = chainId ? [chainId] : ([8453, 84532] as const);

    if (mode === "factory" || mode === "all") {
      for (const item of chains) {
        await syncFactoryEventsForChain(context, item);
      }
    }

    if (mode === "vaults" || mode === "all") {
      for (const item of chains) {
        await syncVaultEventsForChain(context, item);
      }
    }

    if (mode === "reconcile" || mode === "all") {
      await reconcileVaultMetadata(context);
    }

    return {
      ok: true,
      checkedAt: new Date().toISOString(),
      chainSync: getChainSyncStatuses(context, chainId),
    };
  });
};
