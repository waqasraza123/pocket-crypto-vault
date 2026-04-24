import type { FastifyInstance } from "fastify";
import { isAddress } from "viem";
import { z } from "zod";

import type { VaultMetadataPayload } from "@goal-vault/shared";

import { classifyObservedError } from "../../lib/observability/event-classification";
import { logObservabilitySignal } from "../../lib/observability/logger";
import { serializeVaultDetail, serializeVaultDetailResponse, serializeVaultListResponse, serializeVaultSummary } from "./vaults.serializers";
import { getVaultDetailByAddress, getVaultsByOwner, saveVaultMetadata } from "./vaults.service";

const vaultListQuerySchema = z.object({
  chainId: z.union([z.literal(8453), z.literal(84532)]),
  ownerWallet: z.string().trim(),
});

const vaultMetadataSchema = z.object({
  contractAddress: z.string().trim(),
  chainId: z.union([z.literal(8453), z.literal(84532)]),
  ownerWallet: z.string().trim(),
  displayName: z.string().trim().min(1),
  category: z.string().trim().optional().nullable(),
  note: z.string().trim().optional().nullable(),
  accentTheme: z.enum(["sand", "sage", "sky", "terracotta"]).optional().nullable(),
  targetAmount: z.string().trim().min(1),
  unlockDate: z.string().trim().min(1),
});

export const registerVaultRoutes = (app: FastifyInstance) => {
  app.get("/vaults", async (request, reply) => {
    const parsed = vaultListQuerySchema.safeParse(request.query);

    if (!parsed.success || !isAddress(parsed.data.ownerWallet)) {
      return reply.status(400).send({
        message: "Expected a valid owner wallet and chain id.",
      });
    }

    try {
      const result = getVaultsByOwner({
        context: app.goalVaultContext,
        chainId: parsed.data.chainId,
        ownerWallet: parsed.data.ownerWallet as `0x${string}`,
      });
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_list_read",
        status: "succeeded",
        message: "Vault list served.",
        route: "/vaults",
        requestId: request.id,
        chainId: parsed.data.chainId,
        count: result.items.length,
      });

      return serializeVaultListResponse({
        items: result.items.map((item) =>
          serializeVaultSummary({
            vault: item.vault,
            events: item.events,
            freshness: item.freshness,
          }),
        ),
      });
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_list_read",
        status: "failed",
        message: "Vault list failed.",
        route: "/vaults",
        requestId: request.id,
        chainId: parsed.data.chainId,
        errorClass: classifyObservedError(error),
      });
      return reply.status(503).send({
        message: "Vault list is temporarily unavailable.",
      });
    }
  });

  app.get("/vaults/:vaultAddress", async (request, reply) => {
    const params = request.params as { vaultAddress?: string };
    const parsed = z
      .object({
        chainId: z.union([z.literal(8453), z.literal(84532)]),
      })
      .safeParse(request.query);

    if (!params.vaultAddress || !isAddress(params.vaultAddress) || !parsed.success) {
      return reply.status(400).send({
        message: "Expected a valid vault address and chain id.",
      });
    }

    try {
      const detail = getVaultDetailByAddress({
        context: app.goalVaultContext,
        chainId: parsed.data.chainId,
        vaultAddress: params.vaultAddress as `0x${string}`,
      });

      if (!detail) {
        logObservabilitySignal(app.log, {
          domain: "api",
          action: "vault_detail_read",
          status: "degraded",
          message: "Vault detail was not found.",
          route: "/vaults/:vaultAddress",
          requestId: request.id,
          chainId: parsed.data.chainId,
          metadata: {
            notFound: true,
          },
        });
        return reply.status(404).send({
          message: "Vault was not found.",
        });
      }

      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_detail_read",
        status: "succeeded",
        message: "Vault detail served.",
        route: "/vaults/:vaultAddress",
        requestId: request.id,
        chainId: parsed.data.chainId,
        count: detail.events.length,
      });

      return serializeVaultDetailResponse({
        item: serializeVaultDetail({
          vault: detail.vault,
          events: detail.events,
          freshness: detail.freshness,
        }),
      });
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_detail_read",
        status: "failed",
        message: "Vault detail failed.",
        route: "/vaults/:vaultAddress",
        requestId: request.id,
        chainId: parsed.data.chainId,
        errorClass: classifyObservedError(error),
      });
      return reply.status(503).send({
        message: "Vault details are temporarily unavailable.",
      });
    }
  });

  app.post("/vaults", async (request, reply) => {
    const parsed = vaultMetadataSchema.safeParse(request.body);

    if (!parsed.success || !isAddress(parsed.data.contractAddress) || !isAddress(parsed.data.ownerWallet)) {
      return reply.status(400).send({
        message: "Vault metadata payload is invalid.",
      });
    }

    try {
      const metadata = await saveVaultMetadata(app.goalVaultContext, parsed.data as VaultMetadataPayload);
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_metadata_save",
        status: "succeeded",
        message: "Vault metadata saved.",
        route: "/vaults",
        requestId: request.id,
        chainId: metadata.chainId,
        vaultAddress: metadata.contractAddress,
      });
      return reply.status(201).send({
        contractAddress: metadata.contractAddress,
        chainId: metadata.chainId,
        metadataStatus: metadata.metadataStatus,
        reconciliationStatus: metadata.reconciliationStatus,
      });
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_metadata_save",
        status: "failed",
        message: "Vault metadata save failed.",
        route: "/vaults",
        requestId: request.id,
        chainId: parsed.data.chainId,
        vaultAddress: parsed.data.contractAddress as `0x${string}`,
        errorClass: classifyObservedError(error),
      });
      return reply.status(503).send({
        message: "Vault details could not be saved yet.",
      });
    }
  });
};
