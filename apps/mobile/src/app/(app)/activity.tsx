import { Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { createConnectionAnalyticsContext, useScreenTracking, useTrackEventWhen } from "../../lib/analytics";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useVaultActivity } from "../../hooks/useVaultActivity";
import { formatLongDate } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { getStaggerDelay } from "../../lib/motion/list-motion";
import { colors, radii, spacing } from "../../theme";
import { AppErrorState, AppLoadingState, DisconnectedState, GuidedStepsCard, StateBanner } from "../../components/feedback";
import { NetworkStatusBanner, ScreenHeader } from "../../components/layout";
import { AppText, EmptyState, MotionView, PageContainer, PrimaryButton, Screen, SurfaceCard } from "../../components/primitives";
import { routes } from "../../lib/routing";

export default function ActivityScreen() {
  const router = useRouter();
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { dataSource, events, isLoading, notice } = useVaultActivity();
  const { inlineDirection, messages } = useI18n();
  const analyticsContext = useMemo(
    () => createConnectionAnalyticsContext(connectionState),
    [connectionState],
  );

  useScreenTracking(
    "activity_viewed",
    {
      eventCount: events.length,
      dataSource,
    },
    `activity:${connectionState.status}:${events.length}:${dataSource}`,
    analyticsContext,
  );

  useTrackEventWhen({
    name: "empty_state_viewed",
    payload: {
      surface: "activity",
      kind: "no_activity",
    },
    when: connectionState.status === "ready" && !isLoading && events.length === 0,
    key: `activity-empty:${connectionState.session?.address ?? "guest"}`,
    context: analyticsContext,
  });

  useTrackEventWhen({
    name: "degraded_state_viewed",
    payload: {
      surface: "activity",
      degradedEvent: dataSource === "fallback" ? "api_fetch_failed" : "index_lag_visible",
    },
    when: connectionState.status === "ready" && !isLoading && dataSource === "fallback" && events.length > 0,
    key: `activity-degraded:${dataSource}:${events.length}`,
    context: analyticsContext,
  });

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <Stack.Screen options={{ title: messages.pages.activity.title }} />
      <PageContainer width="reading" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.activity.eyebrow}
          title={messages.pages.activity.title}
          description={messages.pages.activity.description}
          action={<PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />}
        />
        {connectionState.status === "walletUnavailable" || connectionState.status === "disconnected" ? (
          <DisconnectedState onConnect={() => void connect()} />
        ) : null}
        {connectionState.status === "unsupportedNetwork" ? (
          <NetworkStatusBanner onSwitch={() => void switchNetwork()} />
        ) : null}
        {connectionState.status === "ready" && isLoading ? (
          <AppLoadingState title={messages.feedback.syncingTitle} description={messages.pages.activity.description} />
        ) : null}
        {notice ? (
          <StateBanner
            icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
            label={notice}
            tone={dataSource === "fallback" ? "warning" : "neutral"}
          />
        ) : null}
        {connectionState.status === "ready" && !isLoading && events.length === 0 ? (
          <View style={{ gap: spacing[4] }}>
            <GuidedStepsCard
              description={messages.pages.activity.startHereDescription}
              eyebrow={messages.pages.activity.emptyEyebrow}
              icon="timeline-clock-outline"
              steps={messages.pages.activity.startHereSteps}
              title={messages.pages.activity.startHereTitle}
            >
              <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />
            </GuidedStepsCard>
            <EmptyState
              eyebrow={messages.pages.activity.emptyEyebrow}
              description={messages.pages.activity.emptyDescription}
              highlights={messages.pages.activity.emptyHighlights}
              icon="timeline-clock-outline"
              title={messages.pages.activity.emptyTitle}
            >
              <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />
            </EmptyState>
          </View>
        ) : null}
        {connectionState.status === "ready" && !isLoading && dataSource === "fallback" && events.length > 0 ? (
          <AppErrorState
            description={messages.feedback.partialStateDescription}
            primaryAction={{
              label: messages.common.buttons.tryAgain,
              onPress: () => router.replace("/activity"),
              icon: "refresh",
            }}
            title={messages.feedback.partialStateTitle}
          />
        ) : null}
        <View style={{ gap: spacing[4] }}>
          {events.map((event, index) => (
            <MotionView key={event.id} delay={getStaggerDelay(index)} style={{ gap: 0 }}>
              <SurfaceCard>
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
            </MotionView>
          ))}
        </View>
      </PageContainer>
    </Screen>
  );
}
