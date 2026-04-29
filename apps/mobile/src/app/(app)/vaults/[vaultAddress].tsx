import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import {
  createConnectionAnalyticsContext,
  getSavedAmountBucket,
  normalizeAnalyticsDataSource,
  normalizeWithdrawAvailability,
  useScreenTracking,
  useTrackEventWhen,
} from "../../../lib/analytics";
import { useTransactionRecovery } from "../../../hooks/useTransactionRecovery";
import { useVaultDepositFlow } from "../../../hooks/useVaultDepositFlow";
import { useVaultDetail } from "../../../hooks/useVaultDetail";
import { useVaultUnlockFlow } from "../../../hooks/useVaultUnlockFlow";
import { useVaultWithdrawFlow } from "../../../hooks/useVaultWithdrawFlow";
import { useWalletConnection } from "../../../hooks/useWalletConnection";
import { useI18n } from "../../../lib/i18n";
import { parseVaultRouteParams } from "../../../lib/validation";
import { useAdaptiveLayout } from "../../../hooks/useAdaptiveLayout";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { routes } from "../../../lib/routing";
import { colors, radii, spacing } from "../../../theme";
import {
  AppLoadingState,
  DisconnectedState,
  GuidedStepsCard,
  MetadataRecoveryNotice,
  StateBanner,
  TransactionRecoveryNotice,
} from "../../../components/feedback";
import { NativeAppScreenShell, NativeScreenHeader, NativeScrollRegion, NetworkStatusBanner, ScreenHeader } from "../../../components/layout";
import { AppText, EmptyState, IconButton, MotionView, PageContainer, Screen, SecondaryButton } from "../../../components/primitives";
import {
  DepositActionPanel,
  VaultActivityPreview,
  VaultDetailHeader,
  VaultProgressPanel,
  VaultRulePanel,
  VaultStateNotice,
  WithdrawActionPanel,
} from "../../../components/vaults";

export default function VaultDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { vaultAddress } = parseVaultRouteParams(params);
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { dataSource, degradedState, isLoading, notice, queryStatus, vault } = useVaultDetail(vaultAddress);
  const { items, dismiss } = useTransactionRecovery({
    ownerAddress: connectionState.session?.address ?? null,
    vaultAddress,
  });
  const adaptiveLayout = useAdaptiveLayout();
  const { inlineDirection, messages } = useI18n();
  const [activePanel, setActivePanel] = useState<"deposit" | "withdraw" | "activity">("deposit");
  const depositFlow = useVaultDepositFlow(vault);
  const withdrawFlow = useVaultWithdrawFlow(vault);
  const unlockFlow = useVaultUnlockFlow(vault);
  const breakpoint = useBreakpoint();
  const activeRecovery = items[0] ?? null;
  const analyticsContext = useMemo(
    () => createConnectionAnalyticsContext(connectionState),
    [connectionState],
  );

  useScreenTracking(
    "vault_detail_viewed",
    {
      vaultAddress,
      vaultStatus: vault?.status ?? "unknown",
      dataSource: normalizeAnalyticsDataSource(dataSource),
      activityCount: vault?.activityPreview.length ?? 0,
    },
    `vault-detail:${vaultAddress}:${vault?.status ?? "unknown"}:${dataSource ?? "none"}`,
    {
      ...analyticsContext,
      vaultAddress,
    },
  );

  useTrackEventWhen({
    name: "deposit_flow_opened",
    payload: {
      vaultAddress,
      vaultStatus: vault?.status ?? "unknown",
      savedAmountBucket: getSavedAmountBucket(vault?.savedAmount ?? 0),
    },
    when: Boolean(vault),
    key: `deposit-opened:${vaultAddress}`,
    context: {
      ...analyticsContext,
      vaultAddress,
    },
  });

  useTrackEventWhen({
    name: "withdraw_flow_opened",
    payload: {
      vaultAddress,
      availability: normalizeWithdrawAvailability(withdrawFlow.eligibility?.availability),
    },
    when: Boolean(vault),
    key: `withdraw-opened:${vaultAddress}:${withdrawFlow.eligibility?.availability ?? "unavailable"}`,
    context: {
      ...analyticsContext,
      vaultAddress,
    },
  });

  useTrackEventWhen({
    name: "empty_state_viewed",
    payload: {
      surface: "vault_detail",
      kind: "vault_not_found",
    },
    when: connectionState.status === "ready" && !isLoading && queryStatus !== "success" && degradedState === "not_found",
    key: `vault-not-found:${vaultAddress}`,
    context: {
      ...analyticsContext,
      vaultAddress,
    },
  });

  useTrackEventWhen({
    name: "degraded_state_viewed",
    payload: {
      surface: "vault_detail",
      degradedEvent:
        degradedState === "missing_metadata"
          ? "metadata_missing"
          : degradedState === "partial"
            ? "partial_data"
            : degradedState === "syncing"
              ? "index_lag_visible"
              : "chain_read_failed",
    },
    when:
      connectionState.status === "ready" &&
      !isLoading &&
      degradedState !== "healthy" &&
      degradedState !== "not_found",
    key: `vault-degraded:${vaultAddress}:${degradedState}`,
    context: {
      ...analyticsContext,
      vaultAddress,
    },
  });

  if (breakpoint.isCompact) {
    const panelOptions = [
      {
        id: "deposit" as const,
        label: messages.common.labels.depositAmount,
      },
      {
        id: "withdraw" as const,
        label: messages.common.labels.availableToWithdraw,
      },
      {
        id: "activity" as const,
        label: messages.common.labels.recentActivity,
      },
    ];

    return (
      <Screen
        scroll={false}
        contentContainerStyle={{ flex: 1 }}
        edges={["left", "right"]}
      >
        <Stack.Screen options={{ title: messages.pages.vaultDetail.title }} />
        <NativeAppScreenShell
          top={
            <View style={{ gap: spacing[3] }}>
              <IconButton
                accessibilityLabel={messages.common.buttons.backToVaults}
                icon="arrow-left"
                onPress={() => router.replace(routes.appHome)}
              />
              <NativeScreenHeader
                eyebrow={messages.pages.vaultDetail.eyebrow}
                title={messages.pages.vaultDetail.title}
                description={messages.pages.vaultDetail.description}
              />
            </View>
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
              <AppLoadingState title={messages.feedback.syncingTitle} description={messages.pages.vaultDetail.description} />
            ) : null}

            {notice && connectionState.status === "ready" ? (
              <StateBanner
                icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
                label={notice}
                tone={dataSource === "fallback" ? "warning" : "neutral"}
              />
            ) : null}

            {activeRecovery ? <TransactionRecoveryNotice item={activeRecovery} onDismiss={() => void dismiss(activeRecovery.id)} /> : null}

            {vault?.metadataStatus === "failed" ? (
              <MetadataRecoveryNotice
                description={messages.feedback.metadataFailedDescription}
                title={messages.feedback.metadataLiveTitle}
              />
            ) : null}

            {vault?.metadataStatus === "pending" ? (
              <MetadataRecoveryNotice
                description={messages.feedback.metadataPendingDescription}
                title={messages.feedback.metadataLiveTitle}
              />
            ) : null}

            {connectionState.status === "ready" && !isLoading && queryStatus !== "success" && degradedState === "not_found" ? (
              <NativeScrollRegion>
                <EmptyState
                  eyebrow={messages.pages.vaultDetail.notAvailableEyebrow}
                  description={messages.pages.vaultDetail.notAvailableDescription}
                  highlights={messages.pages.myVaults.emptyHighlights}
                  icon="shield-star-outline"
                  title={messages.pages.vaultDetail.notAvailableTitle}
                >
                  <SecondaryButton icon="arrow-left" label={messages.common.buttons.backToVaults} onPress={() => router.replace(routes.appHome)} />
                </EmptyState>
              </NativeScrollRegion>
            ) : null}

            {vault ? (
              <>
                <MotionView intensity="structural">
                  <VaultDetailHeader vault={vault} />
                </MotionView>
                <View style={{ flexDirection: inlineDirection(), gap: spacing[2] }}>
                  {panelOptions.map((option) => {
                    const isSelected = activePanel === option.id;

                    return (
                      <Pressable
                        key={option.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => setActivePanel(option.id)}
                        style={({ pressed }) => ({
                          flex: 1,
                          minHeight: 42,
                          borderRadius: radii.md,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: isSelected || pressed ? colors.accentStrong : colors.borderStrong,
                          backgroundColor: isSelected ? colors.accentSoft : pressed ? colors.surfaceStrong : colors.backgroundElevated,
                          paddingHorizontal: spacing[2],
                          paddingVertical: spacing[2],
                        })}
                      >
                        <AppText
                          align="center"
                          numberOfLines={1}
                          size="xs"
                          style={isSelected ? { color: colors.accentStrong } : undefined}
                          tone={isSelected ? "accent" : "secondary"}
                          weight="bold"
                        >
                          {option.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={{ flex: 1, minHeight: 0 }}>
                  <NativeScrollRegion>
                    {activePanel === "deposit" ? (
                      <>
                        <VaultProgressPanel vault={vault} />
                        <DepositActionPanel flow={depositFlow} vault={vault} />
                      </>
                    ) : null}
                    {activePanel === "withdraw" ? (
                      <>
                        <VaultRulePanel eligibility={withdrawFlow.eligibility} vault={vault} />
                        <WithdrawActionPanel flow={withdrawFlow} unlockFlow={unlockFlow} vault={vault} />
                      </>
                    ) : null}
                    {activePanel === "activity" ? (
                      <VaultActivityPreview events={vault.activityPreview} onOpenTimeline={() => router.push(routes.activity)} />
                    ) : null}
                  </NativeScrollRegion>
                </View>
              </>
            ) : null}
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
      <Stack.Screen options={{ title: messages.pages.vaultDetail.title }} />
      <PageContainer width="dashboard" style={{ gap: breakpoint.isCompact ? spacing[5] : spacing[8], paddingTop: breakpoint.isCompact ? spacing[4] : spacing[6] }}>
        {breakpoint.isCompact ? (
          <IconButton
            accessibilityLabel={messages.common.buttons.backToVaults}
            icon="arrow-left"
            onPress={() => router.replace(routes.appHome)}
          />
        ) : (
          <ScreenHeader
            eyebrow={messages.pages.vaultDetail.eyebrow}
            title={messages.pages.vaultDetail.title}
            description={messages.pages.vaultDetail.description}
            action={<SecondaryButton icon="arrow-left" label={messages.common.buttons.backToVaults} onPress={() => router.replace(routes.appHome)} />}
          />
        )}

        {connectionState.status === "walletUnavailable" || connectionState.status === "disconnected" ? (
          <DisconnectedState onConnect={() => void connect()} />
        ) : null}

        {connectionState.status === "unsupportedNetwork" ? (
          <NetworkStatusBanner onSwitch={() => void switchNetwork()} />
        ) : null}

        {connectionState.status === "ready" && isLoading ? (
          <AppLoadingState title={messages.feedback.syncingTitle} description={messages.pages.vaultDetail.description} />
        ) : null}

        {notice && connectionState.status === "ready" ? (
          <StateBanner
            icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
            label={notice}
            tone={dataSource === "fallback" ? "warning" : "neutral"}
          />
        ) : null}

        {activeRecovery ? <TransactionRecoveryNotice item={activeRecovery} onDismiss={() => void dismiss(activeRecovery.id)} /> : null}

        {vault?.metadataStatus === "failed" ? (
          <MetadataRecoveryNotice
            description={messages.feedback.metadataFailedDescription}
            title={messages.feedback.metadataLiveTitle}
          />
        ) : null}

        {vault?.metadataStatus === "pending" ? (
          <MetadataRecoveryNotice
            description={messages.feedback.metadataPendingDescription}
            title={messages.feedback.metadataLiveTitle}
          />
        ) : null}

        {connectionState.status === "ready" &&
        !isLoading &&
        degradedState !== "healthy" &&
        degradedState !== "syncing" &&
        degradedState !== "not_found" ? (
          <VaultStateNotice
            description={notice ?? messages.pages.vaultDetail.notAvailableDescription}
            onRetry={() => router.replace(routes.vaultDetail(vaultAddress))}
            state={degradedState}
            title={messages.feedback.dataUnavailableTitle}
          />
        ) : null}

        {connectionState.status === "ready" && !isLoading && queryStatus !== "success" && degradedState === "not_found" ? (
          <EmptyState
            eyebrow={messages.pages.vaultDetail.notAvailableEyebrow}
            description={messages.pages.vaultDetail.notAvailableDescription}
            highlights={messages.pages.myVaults.emptyHighlights}
            icon="shield-star-outline"
            title={messages.pages.vaultDetail.notAvailableTitle}
          >
            <SecondaryButton icon="arrow-left" label={messages.common.buttons.backToVaults} onPress={() => router.replace(routes.appHome)} />
          </EmptyState>
        ) : null}

        {vault ? (
          <MotionView intensity="structural">
            <VaultDetailHeader vault={vault} />
          </MotionView>
        ) : null}

        {vault && (vault.savedAmount <= 0 || vault.activityPreview.length === 0) ? (
          <MotionView delay={80}>
            <GuidedStepsCard
              description={messages.pages.vaultDetail.startHereDescription}
              eyebrow={messages.pages.vaultDetail.startHereEyebrow}
              icon="play-circle-outline"
              steps={messages.pages.vaultDetail.startHereSteps}
              title={messages.pages.vaultDetail.startHereTitle}
            />
          </MotionView>
        ) : null}

        {vault && breakpoint.isCompact ? (
          <View style={{ gap: spacing[4] }}>
            <MotionView delay={120}>
              <VaultProgressPanel vault={vault} />
            </MotionView>
            <MotionView delay={150}>
              <VaultRulePanel eligibility={withdrawFlow.eligibility} vault={vault} />
            </MotionView>
            <MotionView delay={180}>
              <DepositActionPanel flow={depositFlow} vault={vault} />
            </MotionView>
            <MotionView delay={210}>
              <WithdrawActionPanel flow={withdrawFlow} unlockFlow={unlockFlow} vault={vault} />
            </MotionView>
            <MotionView delay={240}>
              <VaultActivityPreview events={vault.activityPreview} onOpenTimeline={() => router.push(routes.activity)} />
            </MotionView>
          </View>
        ) : vault ? (
          <View style={{ flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column", gap: spacing[4] }}>
            <MotionView delay={120} style={{ flex: 1, gap: spacing[4] }}>
              <VaultProgressPanel vault={vault} />
              <VaultRulePanel eligibility={withdrawFlow.eligibility} vault={vault} />
              <VaultActivityPreview events={vault.activityPreview} onOpenTimeline={() => router.push(routes.activity)} />
            </MotionView>
            <MotionView delay={180} style={{ flex: 1, gap: spacing[4] }}>
              <DepositActionPanel flow={depositFlow} vault={vault} />
              <WithdrawActionPanel flow={withdrawFlow} unlockFlow={unlockFlow} vault={vault} />
            </MotionView>
          </View>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
