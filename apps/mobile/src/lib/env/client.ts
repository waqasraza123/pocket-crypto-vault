import { appRuntimeEnv } from "@pocket-vault/config";
import type { SupportedChainId } from "@pocket-vault/shared";

import type { AppEnvDiagnostics } from "./schema";

export const clientEnv = appRuntimeEnv;

export const envDiagnostics: AppEnvDiagnostics = {
  environment: appRuntimeEnv.environment,
  deploymentTarget: appRuntimeEnv.deploymentTarget,
  validationErrors: appRuntimeEnv.validationErrors,
  configState: appRuntimeEnv.configState,
  releaseReadiness: appRuntimeEnv.releaseReadiness,
};

export const hasRpcUrlForChain = (chainId: SupportedChainId): boolean => Boolean(clientEnv.rpcUrls[chainId]);

export const hasFactoryAddressForChain = (chainId: SupportedChainId): boolean =>
  Boolean(clientEnv.factoryAddresses[chainId]);

export const hasApiBaseUrl = (): boolean => Boolean(clientEnv.apiBaseUrl);

export const getBackendBaseUrl = (): string | null => {
  if (!clientEnv.apiBaseUrl) {
    return null;
  }

  return clientEnv.apiBaseUrl.replace(/\/+$/, "");
};
