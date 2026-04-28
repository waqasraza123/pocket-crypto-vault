import { productConfig } from "@pocket-vault/config";

import { clientEnv, hasRpcUrlForChain } from "../env/client";
import { defaultGoalVaultChainId, goalVaultSupportedChainIds, goalVaultSupportedChains } from "./chains";

const walletIconSvg = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'><rect width='256' height='256' rx='56' fill='#F4EFE7'/><path fill='#1E2B26' d='M68 96c0-15.5 12.5-28 28-28h64c15.5 0 28 12.5 28 28v64c0 15.5-12.5 28-28 28H96c-15.5 0-28-12.5-28-28V96Z'/><path fill='#C58E55' d='M98 118h60c13.3 0 24 10.7 24 24s-10.7 24-24 24H98c-13.3 0-24-10.7-24-24s10.7-24 24-24Z'/></svg>",
);

export const walletMetadata = {
  name: productConfig.name,
  description: "Goal-based USDC vaults on Base.",
  url: clientEnv.walletMetadataUrl ?? "https://goalvault.invalid",
  icons: [`data:image/svg+xml,${walletIconSvg}`] as string[],
};

export const walletRuntimeConfig = {
  isEnabled: Boolean(clientEnv.reownProjectId && clientEnv.walletMetadataUrl),
  projectId: clientEnv.reownProjectId,
  metadataUrl: clientEnv.walletMetadataUrl,
  hasAnyRpcUrl: goalVaultSupportedChainIds.some((chainId) => hasRpcUrlForChain(chainId)),
  supportedChains: goalVaultSupportedChains,
  defaultChainId: defaultGoalVaultChainId,
} as const;
