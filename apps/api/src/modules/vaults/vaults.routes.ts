import type { FastifyInstance } from "fastify";
import { isAddress } from "viem";
import { z } from "zod";

import type { VaultMetadataPayload, VaultMetadataWriteRequest } from "@pocket-vault/shared";

import { classifyObservedError } from "../../lib/observability/event-classification";
import { logObservabilitySignal } from "../../lib/observability/logger";
import { syncVaultAddressForChain } from "../indexer/vault-sync.service";
import { verifyVaultMetadataWriteRequest } from "./metadata-security";
import { serializeVaultDetail, serializeVaultDetailResponse, serializeVaultListResponse, serializeVaultSummary } from "./vaults.serializers";
import { getVaultDetailByAddress, getVaultsByOwner, saveVaultMetadata } from "./vaults.service";

const vaultListQuerySchema = z.object({
  chainId: z.union([z.literal(8453), z.literal(84532)]),
  ownerWallet: z.string().trim(),
});

const vaultMetadataSchema = z.object({
  metadata: z.object({
    contractAddress: z.string().trim(),
    chainId: z.union([z.literal(8453), z.literal(84532)]),
    ownerWallet: z.string().trim(),
    createdTxHash: z.string().trim(),
    displayName: z.string().trim().min(1),
    category: z.string().trim().optional().nullable(),
    note: z.string().trim().optional().nullable(),
    accentTheme: z.enum(["sand", "sage", "sky", "terracotta"]).optional().nullable(),
    targetAmount: z.string().trim().min(1),
    ruleType: z.enum(["timeLock", "cooldownUnlock", "guardianApproval"]),
    unlockDate: z.string().trim().optional().nullable(),
    cooldownDurationSeconds: z.number().int().optional().nullable(),
    guardianAddress: z.string().trim().optional().nullable(),
  }),
  auth: z.object({
    issuedAt: z.string().trim().datetime(),
    signature: z.string().trim(),
  }),
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
      const result = await getVaultsByOwner({
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
      const detail = await getVaultDetailByAddress({
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

    if (
      !parsed.success ||
      !isAddress(parsed.data.metadata.contractAddress) ||
      !isAddress(parsed.data.metadata.ownerWallet)
    ) {
      return reply.status(400).send({
        message: "Vault metadata payload is invalid.",
      });
    }

    try {
      const payload: VaultMetadataWriteRequest = {
        metadata: parsed.data.metadata as VaultMetadataPayload,
        auth: {
          issuedAt: parsed.data.auth.issuedAt,
          signature: parsed.data.auth.signature as `0x${string}`,
        },
      };
      const verification = await verifyVaultMetadataWriteRequest({
        context: app.goalVaultContext,
        request: payload,
      });

      if (verification.status !== "verified") {
        const statusCode =
          verification.code === "unauthorized" ? 401 : verification.code === "invalid" ? 409 : 503;

        return reply.status(statusCode).send({
          message: verification.message,
        });
      }

      const metadata = await saveVaultMetadata(app.goalVaultContext, payload.metadata);
      const client = app.goalVaultContext.clients[metadata.record.chainId];

      if (client && metadata.record.ownerWallet) {
        const latestChainBlock = Number(await client.getBlockNumber());

        await syncVaultAddressForChain({
          context: app.goalVaultContext,
          chainId: metadata.record.chainId,
          latestChainBlock,
          vaultAddress: metadata.record.contractAddress,
          ownerAddress: metadata.record.ownerWallet,
        });
      }

      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_metadata_save",
        status: "succeeded",
        message: "Vault metadata saved.",
        route: "/vaults",
        requestId: request.id,
        chainId: metadata.record.chainId,
        vaultAddress: metadata.record.contractAddress,
      });
      return reply.status(201).send({
        contractAddress: metadata.record.contractAddress,
        chainId: metadata.record.chainId,
        metadataStatus: metadata.record.metadataStatus,
        reconciliationStatus: metadata.record.reconciliationStatus,
        result: metadata.result,
      });
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_metadata_save",
        status: "failed",
        message: "Vault metadata save failed.",
        route: "/vaults",
        requestId: request.id,
        chainId: parsed.data.metadata.chainId,
        vaultAddress: parsed.data.metadata.contractAddress as `0x${string}`,
        errorClass: classifyObservedError(error),
      });
      return reply.status(503).send({
        message: "Vault details could not be saved yet.",
      });
    }
  });
};
