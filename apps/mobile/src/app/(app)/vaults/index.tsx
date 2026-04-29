import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { View } from "react-native";

import { getUnlockedVaultCount, getTotalSaved } from "../../../features/vault-list/selectors";
import { formatUsdc } from "../../../lib/format";
import { createConnectionAnalyticsContext, normalizeAnalyticsDataSource, useScreenTracking, useTrackEventWhen } from "../../../lib/analytics";
import { useI18n } from "../../../lib/i18n";
import { routes } from "../../../lib/routing";
import { colors, radii, spacing } from "../../../theme";
import { useAppReadiness } from "../../../hooks/useAppReadiness";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useWalletConnection } from "../../../hooks/useWalletConnection";
import { useVaults } from "../../../hooks/useVaults";
import {
  AppErrorState,
  AppLoadingState,
  ConfigurationNotice,
  DisconnectedState,
  GuidedStepsCard,
  StateBanner,
} from "../../../components/feedback";
import {
  MobileActionBar,
  NativeActionDock,
  NativeAppScreenShell,
  NativeMetricRow,
  NativeScreenHeader,
  NativeScrollRegion,
  NetworkStatusBanner,
  ScreenHeader,
} from "../../../components/layout";
import { AnimatedNumberText, AppText, EmptyState, MotionView, PageContainer, PrimaryButton, Screen, SurfaceCard } from "../../../components/primitives";
import { VaultGrid } from "../../../components/vaults";

export default function MyVaultsScreen() {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { readiness } = useAppReadiness();
  const { dataSource, degradedState, isLoading, notice, queryStatus, vaults } = useVaults();
  const { messages } = useI18n();
  const totalSaved = getTotalSaved(vaults);
  const unlockedCount = getUnlockedVaultCount(vaults);
  const analyticsContext = useMemo(
    () => createConnectionAnalyticsContext(connectionState),
    [connectionState],
  );
  const dashboardMetrics = [
    {
      label: messages.common.labels.totalSaved,
      value: totalSaved,
      formatValue: formatUsdc,
      icon: "wallet-outline",
      tone: "accent" as const,
      iconColor: colors.accentStrong,
      iconBackgroundColor: colors.accentSoft,
      cardBackgroundColor: colors.backgroundElevated,
      borderColor: colors.borderStrong,
    },
    {
      label: messages.common.labels.vaultCount,
      value: vaults.length,
      icon: "shield-lock-outline",
      tone: "default" as const,
      iconColor: colors.positive,
      iconBackgroundColor: colors.positiveSoft,
      cardBackgroundColor: colors.surfaceGlass,
      borderColor: colors.borderStrong,
    },
    {
      label: messages.common.labels.eligibleSoon,
      value: unlockedCount,
      icon: "timer-check-outline",
      tone: "muted" as const,
      iconColor: colors.warning,
      iconBackgroundColor: colors.warningSoft,
      cardBackgroundColor: colors.warningSoft,
      borderColor: colors.warning,
      helper: messages.common.labels.withdrawWhenEligible,
    },
  ] satisfies Array<{
    label: string;
    value: number;
    formatValue?: (value: number) => string;
    icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
    tone: "default" | "muted" | "accent";
    iconColor: string;
    iconBackgroundColor: string;
    cardBackgroundColor: string;
    borderColor: string;
    helper?: string;
  }>;

  const showVaultGrid = connectionState.status === "ready" && !isLoading && queryStatus === "success";

  useScreenTracking(
    "dashboard_viewed",
    {
      hasVaults: vaults.length > 0,
      vaultCount: vaults.length,
      unlockedVaultCount: unlockedCount,
      dataSource: normalizeAnalyticsDataSource(dataSource),
    },
    `dashboard:${connectionState.status}:${queryStatus}:${vaults.length}:${unlockedCount}:${dataSource ?? "none"}`,
    analyticsContext,
  );

  useTrackEventWhen({
    name: "empty_state_viewed",
    payload: {
      surface: "dashboard",
      kind: "no_vaults",
    },
    when: connectionState.status === "ready" && !isLoading && queryStatus === "empty",
    key: `dashboard-empty:${connectionState.session?.address ?? "guest"}`,
    context: analyticsContext,
  });

  useTrackEventWhen({
    name: "degraded_state_viewed",
    payload: {
      surface: "dashboard",
      degradedEvent:
        degradedState === "partial"
          ? "partial_data"
          : dataSource === "fallback"
            ? "api_fetch_failed"
            : "chain_read_failed",
    },
    when: connectionState.status === "ready" && !isLoading && (queryStatus === "error" || queryStatus === "unavailable"),
    key: `dashboard-degraded:${degradedState}:${dataSource ?? "none"}`,
    context: analyticsContext,
  });

  if (breakpoint.isCompact) {
    return (
      <Screen
        scroll={false}
        contentContainerStyle={{ flex: 1 }}
        edges={["left", "right"]}
      >
        <Stack.Screen options={{ title: messages.pages.myVaults.title }} />
        <NativeAppScreenShell
          top={
            <NativeScreenHeader
              eyebrow={messages.pages.myVaults.eyebrow}
              title={messages.pages.myVaults.title}
              description={messages.pages.myVaults.description}
            />
          }
          bottom={
            <NativeActionDock>
              <PrimaryButton
                fullWidth
                icon="plus"
                label={messages.common.buttons.createVault}
                onPress={() => router.push(routes.createVault)}
              />
            </NativeActionDock>
          }
        >
          <View style={{ flex: 1, minHeight: 0, gap: spacing[3] }}>
            {connectionState.status === "walletUnavailable" || connectionState.status === "disconnected" ? (
              <DisconnectedState onConnect={() => void connect()} />
            ) : null}

            {connectionState.status === "unsupportedNetwork" ? (
              <NetworkStatusBanner
                label={connectionState.session?.chainId ? `Chain ${connectionState.session.chainId}` : null}
                onSwitch={() => void switchNetwork()}
              />
            ) : null}

            {connectionState.status === "ready" && readiness.configurationStatus === "invalid" ? <ConfigurationNotice /> : null}

            {connectionState.status === "ready" && isLoading ? (
              <AppLoadingState
                title={messages.feedback.syncingTitle}
                description={messages.pages.myVaults.description}
              />
            ) : null}

            {notice && connectionState.status === "ready" ? (
              <StateBanner
                icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
                label={notice}
                tone={dataSource === "fallback" ? "warning" : "neutral"}
              />
            ) : null}

            <NativeMetricRow
              items={[
                {
                  label: messages.common.labels.totalSaved,
                  value: formatUsdc(totalSaved),
                  icon: "wallet-outline",
                  tone: "accent",
                },
                {
                  label: messages.common.labels.vaultCount,
                  value: String(vaults.length),
                  icon: "shield-lock-outline",
                  tone: "positive",
                },
                {
                  label: messages.common.labels.eligibleSoon,
                  value: String(unlockedCount),
                  icon: "timer-check-outline",
                  tone: "warning",
                },
              ]}
            />

            <View style={{ flex: 1, minHeight: 0 }}>
              {connectionState.status === "ready" && !isLoading && queryStatus === "empty" ? (
                <NativeScrollRegion>
                  <GuidedStepsCard
                    description={messages.pages.myVaults.startHereDescription}
                    eyebrow={messages.pages.myVaults.emptyEyebrow}
                    icon="bullseye-arrow"
                    steps={messages.pages.myVaults.startHereSteps}
                    title={messages.pages.myVaults.startHereTitle}
                  />
                </NativeScrollRegion>
              ) : null}

              {connectionState.status === "ready" && !isLoading && (queryStatus === "error" || queryStatus === "unavailable") ? (
                <NativeScrollRegion>
                  <AppErrorState
                    description={
                      degradedState === "partial"
                        ? messages.feedback.partialStateDescription
                        : messages.feedback.dataUnavailableDescription
                    }
                    primaryAction={{
                      label: messages.common.buttons.tryAgain,
                      onPress: () => router.replace(routes.appHome),
                      icon: "refresh",
                    }}
                    title={
                      degradedState === "partial"
                        ? messages.feedback.partialStateTitle
                        : messages.feedback.dataUnavailableTitle
                    }
                  />
                </NativeScrollRegion>
              ) : null}

              {showVaultGrid ? (
                <NativeScrollRegion>
                  <VaultGrid vaults={vaults} />
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
      footer={
        breakpoint.isCompact ? (
          <MobileActionBar>
            <PrimaryButton
              fullWidth
              icon="plus"
              label={messages.common.buttons.createVault}
              onPress={() => router.push(routes.createVault)}
            />
          </MobileActionBar>
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: messages.pages.myVaults.title }} />
      <PageContainer width="dashboard" style={{ gap: breakpoint.isCompact ? spacing[5] : spacing[8], paddingTop: breakpoint.isCompact ? spacing[4] : spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.myVaults.eyebrow}
          title={messages.pages.myVaults.title}
          description={messages.pages.myVaults.description}
          action={
            breakpoint.isCompact ? undefined :
            <PrimaryButton
              icon="plus"
              label={messages.common.buttons.createVault}
              onPress={() => router.push(routes.createVault)}
            />
          }
        />

        {connectionState.status === "walletUnavailable" || connectionState.status === "disconnected" ? (
          <DisconnectedState onConnect={() => void connect()} />
        ) : null}

        {connectionState.status === "unsupportedNetwork" ? (
          <NetworkStatusBanner
            label={connectionState.session?.chainId ? `Chain ${connectionState.session.chainId}` : null}
            onSwitch={() => void switchNetwork()}
          />
        ) : null}

        {connectionState.status === "ready" && readiness.configurationStatus === "invalid" ? <ConfigurationNotice /> : null}

        {connectionState.status === "ready" && isLoading ? (
          <AppLoadingState
            title={messages.feedback.syncingTitle}
            description={messages.pages.myVaults.description}
          />
        ) : null}

        {notice && connectionState.status === "ready" ? (
          <StateBanner
            icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
            label={notice}
            tone={dataSource === "fallback" ? "warning" : "neutral"}
          />
        ) : null}

        <View style={{ flexDirection: breakpoint.isCompact ? "column" : "row", flexWrap: breakpoint.isCompact ? "nowrap" : "wrap", gap: breakpoint.isCompact ? spacing[3] : spacing[4] }}>
          {dashboardMetrics.map((metric, index) => (
            <MotionView key={metric.label} delay={index * 70} style={{ flex: 1, minWidth: breakpoint.isCompact ? undefined : 220 }}>
              <SurfaceCard
                accentColor={metric.iconColor}
                tone={metric.tone}
                style={{
                  flex: 1,
                  minWidth: breakpoint.isCompact ? undefined : 220,
                  backgroundColor: metric.cardBackgroundColor,
                  borderColor: metric.borderColor,
                  padding: breakpoint.isCompact ? spacing[4] : spacing[5],
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
                  <View style={{ gap: spacing[1] }}>
                    <AppText tone="secondary">{metric.label}</AppText>
                    <AnimatedNumberText formatValue={metric.formatValue} size="xl" value={metric.value} weight="semibold" />
                  </View>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: radii.md,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: metric.iconBackgroundColor,
                    }}
                  >
                    <MaterialCommunityIcons color={metric.iconColor} name={metric.icon} size={20} />
                  </View>
                </View>
                {metric.helper ? (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      borderRadius: radii.pill,
                      backgroundColor: colors.surface,
                      paddingHorizontal: spacing[3],
                      paddingVertical: spacing[2],
                    }}
                  >
                    <AppText size="sm" tone="secondary">
                      {metric.helper}
                    </AppText>
                  </View>
                ) : null}
              </SurfaceCard>
            </MotionView>
          ))}
        </View>

        {connectionState.status === "ready" && !isLoading && queryStatus === "empty" ? (
          <View style={{ gap: spacing[4] }}>
            <GuidedStepsCard
              description={messages.pages.myVaults.startHereDescription}
              eyebrow={messages.pages.myVaults.emptyEyebrow}
              icon="bullseye-arrow"
              steps={messages.pages.myVaults.startHereSteps}
              title={messages.pages.myVaults.startHereTitle}
            >
              <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />
            </GuidedStepsCard>
            <EmptyState
              eyebrow={messages.pages.myVaults.emptyEyebrow}
              description={messages.pages.myVaults.emptyDescription}
              highlights={messages.pages.myVaults.emptyHighlights}
              title={messages.pages.myVaults.emptyTitle}
            >
              <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />
            </EmptyState>
          </View>
        ) : null}

        {connectionState.status === "ready" && !isLoading && (queryStatus === "error" || queryStatus === "unavailable") ? (
          <AppErrorState
            description={
              degradedState === "partial"
                ? messages.feedback.partialStateDescription
                : messages.feedback.dataUnavailableDescription
            }
            primaryAction={{
              label: messages.common.buttons.tryAgain,
              onPress: () => router.replace(routes.appHome),
              icon: "refresh",
            }}
            title={
              degradedState === "partial"
                ? messages.feedback.partialStateTitle
                : messages.feedback.dataUnavailableTitle
            }
          />
        ) : null}

        {showVaultGrid ? <VaultGrid vaults={vaults} /> : null}
      </PageContainer>
    </Screen>
  );
}
