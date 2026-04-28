import { Stack, useRouter } from "expo-router";

import { useWalletConnection } from "../hooks/useWalletConnection";
import { useScreenTracking } from "../lib/analytics";
import { getMarketingExperienceState } from "../lib/public/marketing-experience";
import { routes } from "../lib/routing";
import { MarketingShell } from "../components/layout";
import { WalletStatusCard } from "../components/layout/WalletStatusCard";
import { LandingPageContent } from "../components/marketing";

export default function LandingScreen() {
  const router = useRouter();
  const { connectionState } = useWalletConnection();
  const marketingState = getMarketingExperienceState(connectionState.status);

  useScreenTracking(
    "landing_viewed",
    {
      entry: connectionState.status === "ready" ? "returning" : "direct",
    },
    `landing:${connectionState.status}`,
    {
      chainId: connectionState.session?.chain?.id ?? connectionState.session?.chainId ?? null,
      walletStatus: connectionState.status,
    },
  );

  return (
    <MarketingShell>
      <Stack.Screen options={{ title: "Pocket Vault" }} />
      <LandingPageContent
        connectionNotice={<WalletStatusCard />}
        onCreateVault={() => router.push(routes.createVault)}
        onEnterVaults={() => router.push(routes.appHome)}
        onReviewSecurity={() => router.push(routes.security)}
        showConnectionNotice={marketingState.showConnectionNotice}
      />
    </MarketingShell>
  );
}
