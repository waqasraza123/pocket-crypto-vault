import { appRuntimeEnv } from "@goal-vault/config";
import type { SupportedChainId } from "@goal-vault/shared";

import type { AppEnvDiagnostics } from "./schema";

export const clientEnv = appRuntimeEnv;

export const envDiagnostics: AppEnvDiagnostics = {
  validationErrors: appRuntimeEnv.validationErrors,
};

export const hasRpcUrlForChain = (chainId: SupportedChainId): boolean => Boolean(clientEnv.rpcUrls[chainId]);

export const hasFactoryAddressForChain = (chainId: SupportedChainId): boolean =>
  Boolean(clientEnv.factoryAddresses[chainId]);

export const hasApiBaseUrl = (): boolean => Boolean(clientEnv.apiBaseUrl);
