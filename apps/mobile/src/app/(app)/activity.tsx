import { View } from "react-native";

import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useVaultActivity } from "../../hooks/useVaultActivity";
import { formatLongDate } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { DisconnectedState, StateBanner, UnsupportedNetworkNotice } from "../../components/feedback";
import { ScreenHeader } from "../../components/layout";
import { AppText, PageContainer, Screen, SurfaceCard } from "../../components/primitives";

export default function ActivityScreen() {
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { dataSource, events, notice } = useVaultActivity();
  const { inlineDirection, messages } = useI18n();

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="reading" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.activity.eyebrow}
          title={messages.pages.activity.title}
          description={messages.pages.activity.description}
        />
        {connectionState.status === "walletUnavailable" || connectionState.status === "disconnected" ? (
          <DisconnectedState onConnect={() => void connect()} />
        ) : null}
        {connectionState.status === "unsupportedNetwork" ? (
          <UnsupportedNetworkNotice onSwitch={() => void switchNetwork()} />
        ) : null}
        {notice ? (
          <StateBanner
            icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
            label={notice}
            tone={dataSource === "fallback" ? "warning" : "neutral"}
          />
        ) : null}
        <View style={{ gap: spacing[4] }}>
          {events.map((event) => (
            <SurfaceCard key={event.id}>
              <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[4] }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: radii.pill,
                    backgroundColor: colors.accent,
                    marginTop: 8,
                  }}
                />
                <View style={{ flex: 1, gap: spacing[1] }}>
                  <AppText weight="semibold">{event.title}</AppText>
                  <AppText tone="secondary">{event.subtitle}</AppText>
                  <AppText size="sm" tone="muted">
                    {formatLongDate(event.occurredAt)}
                  </AppText>
                </View>
              </View>
            </SurfaceCard>
          ))}
        </View>
      </PageContainer>
    </Screen>
  );
}
