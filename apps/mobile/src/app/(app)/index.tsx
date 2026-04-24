import { Stack, useRouter } from "expo-router";
import { View } from "react-native";

import { getUnlockedVaultCount, getTotalSaved } from "../../features/vault-list/selectors";
import { formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { useAppReadiness } from "../../hooks/useAppReadiness";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useVaults } from "../../hooks/useVaults";
import {
  AppErrorState,
  AppLoadingState,
  ConfigurationNotice,
  DisconnectedState,
  StateBanner,
} from "../../components/feedback";
import { NetworkStatusBanner, ScreenHeader } from "../../components/layout";
import { AppHeading, AppText, EmptyState, PageContainer, PrimaryButton, Screen, SurfaceCard } from "../../components/primitives";
import { VaultGrid } from "../../components/vaults";

export default function MyVaultsScreen() {
  const router = useRouter();
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { readiness } = useAppReadiness();
  const { dataSource, degradedState, isLoading, notice, queryStatus, vaults } = useVaults();
  const { messages } = useI18n();
  const totalSaved = getTotalSaved(vaults);
  const unlockedCount = getUnlockedVaultCount(vaults);

  const showVaultGrid = connectionState.status === "ready" && !isLoading && queryStatus === "success";

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <Stack.Screen options={{ title: messages.pages.myVaults.title }} />
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.myVaults.eyebrow}
          title={messages.pages.myVaults.title}
          description={messages.pages.myVaults.description}
          action={
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

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
          <SurfaceCard style={{ flex: 1, minWidth: 220 }}>
            <AppText tone="secondary">{messages.common.labels.totalSaved}</AppText>
            <AppHeading size="xl">{formatUsdc(totalSaved)}</AppHeading>
          </SurfaceCard>
          <SurfaceCard style={{ flex: 1, minWidth: 220 }}>
            <AppText tone="secondary">{messages.common.labels.vaultCount}</AppText>
            <AppHeading size="xl">{vaults.length}</AppHeading>
          </SurfaceCard>
          <SurfaceCard tone="muted" style={{ flex: 1, minWidth: 220, backgroundColor: colors.accentSoft }}>
            <AppText tone="secondary">{messages.common.labels.eligibleSoon}</AppText>
            <AppHeading size="xl">{unlockedCount}</AppHeading>
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
                {messages.common.labels.withdrawWhenEligible}
              </AppText>
            </View>
          </SurfaceCard>
        </View>

        {connectionState.status === "ready" && !isLoading && queryStatus === "empty" ? (
          <EmptyState
            eyebrow={messages.pages.myVaults.emptyEyebrow}
            description={messages.pages.myVaults.emptyDescription}
            highlights={messages.pages.myVaults.emptyHighlights}
            title={messages.pages.myVaults.emptyTitle}
          >
            <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={() => router.push(routes.createVault)} />
          </EmptyState>
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
