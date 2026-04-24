import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { View } from "react-native";

import { createConnectionAnalyticsContext, useTrackEventWhen } from "../../lib/analytics";
import { useAppReadiness } from "../../hooks/useAppReadiness";
import { useTransactionRecovery } from "../../hooks/useTransactionRecovery";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { spacing } from "../../theme";
import { PageContainer } from "../primitives";
import { AppFooter } from "./AppFooter";
import { AppStatusBanner } from "./AppStatusBanner";
import { TopNavigation } from "./TopNavigation";
import { WalletStatusCard } from "./WalletStatusCard";
import { TransactionRecoveryNotice } from "../feedback";

export const AppShell = ({ children }: PropsWithChildren) => {
  const { connectionState } = useWalletConnection();
  const { readiness } = useAppReadiness();
  const { items, dismiss } = useTransactionRecovery({
    ownerAddress: connectionState.session?.address ?? null,
  });
  const activeRecovery = items[0] ?? null;
  const analyticsContext = useMemo(
    () => createConnectionAnalyticsContext(connectionState),
    [connectionState],
  );

  useTrackEventWhen({
    name: "degraded_state_viewed",
    payload: {
      surface: "app_shell",
      degradedEvent:
        readiness.configurationStatus === "invalid"
          ? "missing_backend_config"
          : readiness.api.status === "degraded" || readiness.api.status === "unavailable"
            ? "api_fetch_failed"
            : "partial_data",
    },
    when: Boolean(readiness.issues[0]),
    key: `app-shell:${readiness.status}:${readiness.api.status}:${readiness.configurationStatus}`,
    context: analyticsContext,
  });

  return (
    <View style={{ flex: 1 }}>
      <TopNavigation area="app" />
      <PageContainer width="dashboard" style={{ gap: spacing[4], paddingTop: spacing[4] }}>
        <AppStatusBanner readiness={readiness} />
        <WalletStatusCard />
        {activeRecovery ? <TransactionRecoveryNotice item={activeRecovery} onDismiss={() => void dismiss(activeRecovery.id)} /> : null}
      </PageContainer>
      <View style={{ flex: 1 }}>{children}</View>
      <AppFooter />
    </View>
  );
};
