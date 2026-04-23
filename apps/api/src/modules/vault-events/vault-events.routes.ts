import type { FastifyInstance } from "fastify";
import { isAddress } from "viem";
import { z } from "zod";

import { serializeActivityFeedResponse, serializeVaultActivityItem, serializeVaultActivityResponse } from "./vault-events.serializers";
import { getOwnerActivity, getVaultActivity } from "./vault-events.service";

const activityQuerySchema = z.object({
  chainId: z.coerce.number().int().optional(),
  ownerWallet: z.string().trim().optional(),
});

export const registerVaultEventRoutes = (app: FastifyInstance) => {
  app.get("/activity", async (request, reply) => {
    const parsed = activityQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid activity query.",
      });
    }

    if (parsed.data.ownerWallet && !isAddress(parsed.data.ownerWallet)) {
      return reply.status(400).send({
        message: "Expected a valid owner wallet address.",
      });
    }

    const context = app.goalVaultContext;
    const items = getOwnerActivity({
      context,
      chainId: parsed.data.chainId as 8453 | 84532 | undefined,
      ownerWallet: parsed.data.ownerWallet as `0x${string}` | undefined,
    }).items.map((event) =>
      serializeVaultActivityItem({
        event,
        vault: context.store.getVault(event.chainId, event.vaultAddress),
      }),
    );

    return serializeActivityFeedResponse({ items });
  });

  app.get("/vaults/:vaultAddress/activity", async (request, reply) => {
    const params = request.params as { vaultAddress?: string };
    const parsed = z
      .object({
        chainId: z.coerce.number().int(),
      })
      .safeParse(request.query);

    if (!params.vaultAddress || !isAddress(params.vaultAddress) || !parsed.success) {
      return reply.status(400).send({
        message: "Expected a valid vault address and chain id.",
      });
    }

    const context = app.goalVaultContext;
    const activity = getVaultActivity({
      context,
      chainId: parsed.data.chainId as 8453 | 84532,
      vaultAddress: params.vaultAddress as `0x${string}`,
    });

    return serializeVaultActivityResponse({
      chainId: parsed.data.chainId as 8453 | 84532,
      vaultAddress: params.vaultAddress as `0x${string}`,
      freshness: activity.freshness,
      items: activity.items.map((event) =>
        serializeVaultActivityItem({
          event,
          vault: context.store.getVault(event.chainId, event.vaultAddress),
        }),
      ),
    });
  });
};
