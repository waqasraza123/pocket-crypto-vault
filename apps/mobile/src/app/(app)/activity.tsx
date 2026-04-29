import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { createConnectionAnalyticsContext, useScreenTracking, useTrackEventWhen } from "../../lib/analytics";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useVaultActivity } from "../../hooks/useVaultActivity";
import { formatLongDate } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { getStaggerDelay } from "../../lib/motion/list-motion";
import { colors, radii, spacing } from "../../theme";
import type { VaultActivityEvent } from "../../types";
import { AppErrorState, AppLoadingState, DisconnectedState, GuidedStepsCard, StateBanner } from "../../components/feedback";
import {
  NativeAppScreenShell,
  NativeMetricRow,
  NativeScreenHeader,
  NativeScrollRegion,
  NetworkStatusBanner,
  ScreenHeader,
} from "../../components/layout";
import { AppHeading, AppText, EmptyState, MotionView, PageContainer, PrimaryButton, Screen, SurfaceCard } from "../../components/primitives";
import { routes } from "../../lib/routing";

const getActivityIcon = (type: VaultActivityEvent["type"]): ComponentProps<typeof MaterialCommunityIcons>["name"] => {
  if (type === "deposit") {
    return "plus-circle-outline";
  }

  if (type === "withdrawal") {
    return "arrow-up-right";
  }

  if (type === "created") {
    return "shield-lock-outline";
  }

  if (type === "milestone") {
    return "flag-checkered";
  }

  return "timeline-check-outline";
};

const getActivityTone = (type: VaultActivityEvent["type"]) => {
  if (type === "deposit" || type === "milestone") {
    return {
      backgroundColor: colors.positiveSoft,
      iconColor: colors.positive,
    };
  }

  if (type === "withdrawal") {
    return {
      backgroundColor: colors.warningSoft,
      iconColor: colors.warning,
    };
  }

  return {
    backgroundColor: colors.accentSoft,
    iconColor: colors.accentStrong,
  };
};

export default function ActivityScreen() {
  const router = useRouter();
  const breakpoint = useBreakpoint();
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

  if (breakpoint.isCompact) {
    return (
      <Screen
        scroll={false}
        contentContainerStyle={{ flex: 1 }}
        edges={["left", "right"]}
      >
        <Stack.Screen options={{ title: messages.pages.activity.title }} />
        <NativeAppScreenShell
          top={
            <NativeScreenHeader
              eyebrow={messages.pages.activity.eyebrow}
              title={messages.pages.activity.title}
              description={messages.pages.activity.description}
            />
          }
        >
          <View style={{ flex: 1, minHeight: 0, gap: spacing[3] }}>
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
            {events.length > 0 ? (
              <NativeMetricRow
                items={[
                  {
                    label: messages.common.labels.recentActivity,
                    value: String(events.length),
                    icon: "timeline-clock-outline",
                    tone: "accent",
                  },
                  {
                    label: messages.common.labels.dataSource,
                    value: dataSource === "fallback" ? messages.common.labels.fallback : messages.common.labels.synced,
                    icon: dataSource === "fallback" ? "database-clock-outline" : "check-circle-outline",
                    tone: dataSource === "fallback" ? "warning" : "positive",
                  },
                ]}
              />
            ) : null}
            <View style={{ flex: 1, minHeight: 0 }}>
              {connectionState.status === "ready" && !isLoading && events.length === 0 ? (
                <NativeScrollRegion>
                  <GuidedStepsCard
                    description={messages.pages.activity.startHereDescription}
                    eyebrow={messages.pages.activity.emptyEyebrow}
                    icon="timeline-clock-outline"
                    steps={messages.pages.activity.startHereSteps}
                    title={messages.pages.activity.startHereTitle}
                  >
                    <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />
                  </GuidedStepsCard>
                </NativeScrollRegion>
              ) : null}
              {connectionState.status === "ready" && !isLoading && dataSource === "fallback" && events.length > 0 ? (
                <NativeScrollRegion>
                  <AppErrorState
                    description={messages.feedback.partialStateDescription}
                    primaryAction={{
                      label: messages.common.buttons.tryAgain,
                      onPress: () => router.replace("/activity"),
                      icon: "refresh",
                    }}
                    title={messages.feedback.partialStateTitle}
                  />
                </NativeScrollRegion>
              ) : null}
              {events.length > 0 ? (
                <NativeScrollRegion>
                  {events.map((event, index) => {
                    const tone = getActivityTone(event.type);

                    return (
                      <MotionView key={event.id} delay={getStaggerDelay(index)} style={{ gap: 0 }}>
                        <SurfaceCard accentColor={tone.iconColor} style={{ padding: spacing[4] }}>
                          <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: radii.md,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: tone.backgroundColor,
                                borderWidth: 1,
                                borderColor: tone.iconColor,
                              }}
                            >
                              <MaterialCommunityIcons color={tone.iconColor} name={getActivityIcon(event.type)} size={21} />
                            </View>
                            <View style={{ flex: 1, gap: spacing[2] }}>
                              <View style={{ gap: spacing[1] }}>
                                <AppText weight="semibold">{event.title}</AppText>
                                <AppText size="sm" tone="secondary">{event.subtitle}</AppText>
                              </View>
                              <AppText size="xs" tone="muted">
                                {formatLongDate(event.occurredAt)}
                              </AppText>
                            </View>
                          </View>
                        </SurfaceCard>
                      </MotionView>
                    );
                  })}
                </NativeScrollRegion>
              ) : null}
            </View>
          </View>
        </NativeAppScreenShell>
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={{ paddingBottom: breakpoint.isCompact ? spacing[6] : spacing[12] }}
      edges={breakpoint.isCompact ? ["left", "right"] : undefined}
    >
      <Stack.Screen options={{ title: messages.pages.activity.title }} />
      <PageContainer width="reading" style={{ gap: breakpoint.isCompact ? spacing[5] : spacing[8], paddingTop: breakpoint.isCompact ? spacing[4] : spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.activity.eyebrow}
          title={messages.pages.activity.title}
          description={messages.pages.activity.description}
          action={breakpoint.isCompact ? undefined : <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />}
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
        {events.length > 0 && breakpoint.isCompact ? (
          <View style={{ flexDirection: inlineDirection(), gap: spacing[3] }}>
            <View
              style={{
                flex: 1,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                backgroundColor: colors.backgroundElevated,
                padding: spacing[4],
                gap: spacing[1],
              }}
            >
              <AppText size="sm" tone="secondary">
                {messages.common.labels.recentActivity}
              </AppText>
              <AppText weight="semibold">{events.length}</AppText>
            </View>
            <View
              style={{
                flex: 1,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                backgroundColor: dataSource === "fallback" ? colors.warningSoft : colors.positiveSoft,
                padding: spacing[4],
                gap: spacing[1],
              }}
            >
              <AppText size="sm" tone="secondary">
                {messages.common.labels.dataSource}
              </AppText>
              <AppText numberOfLines={1} weight="semibold">
                {dataSource === "fallback" ? messages.common.labels.fallback : messages.common.labels.synced}
              </AppText>
            </View>
          </View>
        ) : events.length > 0 ? (
          <SurfaceCard tone="accent" style={{ padding: spacing[5] }}>
            <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: radii.md,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accentSoft,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                }}
              >
                <MaterialCommunityIcons color={colors.accentStrong} name="timeline-clock-outline" size={24} />
              </View>
              <View style={{ flex: 1, gap: spacing[1] }}>
                <AppText size="sm" tone="accent" weight="semibold">
                  {messages.common.labels.recentActivity}
                </AppText>
                <AppHeading size="md">{messages.pages.activity.title}</AppHeading>
                <AppText tone="secondary">{messages.pages.activity.description}</AppText>
              </View>
            </View>
            <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
              <View
                style={{
                  flex: 1,
                  minWidth: 160,
                  borderRadius: radii.lg,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.surfaceGlass,
                  padding: spacing[4],
                  gap: spacing[1],
                }}
              >
                <AppText size="sm" tone="secondary">
                  {messages.common.labels.recentActivity}
                </AppText>
                <AppText weight="semibold">{events.length}</AppText>
              </View>
              <View
                style={{
                  flex: 1,
                  minWidth: 160,
                  borderRadius: radii.lg,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  backgroundColor: dataSource === "fallback" ? colors.warningSoft : colors.positiveSoft,
                  padding: spacing[4],
                  gap: spacing[1],
                }}
              >
                <AppText size="sm" tone="secondary">
                  {messages.common.labels.dataSource}
                </AppText>
                <AppText weight="semibold">
                  {dataSource === "fallback" ? messages.common.labels.fallback : messages.common.labels.synced}
                </AppText>
              </View>
            </View>
          </SurfaceCard>
        ) : null}
        <View style={{ gap: spacing[3] }}>
          {events.map((event, index) => {
            const tone = getActivityTone(event.type);

            return (
              <MotionView key={event.id} delay={getStaggerDelay(index)} style={{ gap: 0 }}>
                <SurfaceCard accentColor={tone.iconColor} style={{ padding: breakpoint.isCompact ? spacing[4] : spacing[5] }}>
                  <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[4] }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: radii.md,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: tone.backgroundColor,
                        borderWidth: 1,
                        borderColor: tone.iconColor,
                      }}
                    >
                      <MaterialCommunityIcons color={tone.iconColor} name={getActivityIcon(event.type)} size={22} />
                    </View>
                    <View style={{ flex: 1, gap: spacing[2] }}>
                      <View style={{ gap: spacing[1] }}>
                        <AppText weight="semibold">{event.title}</AppText>
                        <AppText tone="secondary">{event.subtitle}</AppText>
                      </View>
                      <View
                        style={{
                          alignSelf: "flex-start",
                          borderRadius: radii.pill,
                          borderWidth: 1,
                          borderColor: colors.borderStrong,
                          backgroundColor: colors.surfaceMuted,
                          paddingHorizontal: spacing[3],
                          paddingVertical: spacing[2],
                        }}
                      >
                        <AppText size="sm" tone="muted">
                          {formatLongDate(event.occurredAt)}
                        </AppText>
                      </View>
                    </View>
                  </View>
                </SurfaceCard>
              </MotionView>
            );
          })}
        </View>
      </PageContainer>
    </Screen>
  );
}
