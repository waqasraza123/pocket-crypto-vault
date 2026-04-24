import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { useTransactionRecovery } from "../../../hooks/useTransactionRecovery";
import { useVaultDepositFlow } from "../../../hooks/useVaultDepositFlow";
import { useVaultDetail } from "../../../hooks/useVaultDetail";
import { useVaultWithdrawFlow } from "../../../hooks/useVaultWithdrawFlow";
import { useWalletConnection } from "../../../hooks/useWalletConnection";
import { useI18n } from "../../../lib/i18n";
import { parseVaultRouteParams } from "../../../lib/validation";
import { useAdaptiveLayout } from "../../../hooks/useAdaptiveLayout";
import { routes } from "../../../lib/routing";
import { spacing } from "../../../theme";
import {
  AppLoadingState,
  DisconnectedState,
  MetadataRecoveryNotice,
  StateBanner,
} from "../../../components/feedback";
import { NetworkStatusBanner, ScreenHeader } from "../../../components/layout";
import { EmptyState, PageContainer, Screen, SecondaryButton } from "../../../components/primitives";
import {
  DepositActionPanel,
  VaultActivityPreview,
  VaultDetailHeader,
  VaultProgressPanel,
  VaultRecoveryCard,
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
  const { messages } = useI18n();
  const depositFlow = useVaultDepositFlow(vault);
  const withdrawFlow = useVaultWithdrawFlow(vault);
  const activeRecovery = items[0] ?? null;

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <Stack.Screen options={{ title: messages.pages.vaultDetail.title }} />
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.vaultDetail.eyebrow}
          title={messages.pages.vaultDetail.title}
          description={messages.pages.vaultDetail.description}
        />

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

        {activeRecovery ? <VaultRecoveryCard item={activeRecovery} onDismiss={() => void dismiss(activeRecovery.id)} /> : null}

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

        {vault ? <VaultDetailHeader vault={vault} /> : null}

        {vault ? (
          <View style={{ flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column", gap: spacing[4] }}>
            <View style={{ flex: 1, gap: spacing[4] }}>
              <VaultProgressPanel vault={vault} />
              <VaultRulePanel eligibility={withdrawFlow.eligibility} vault={vault} />
              <VaultActivityPreview events={vault.activityPreview} />
            </View>
            <View style={{ flex: 1, gap: spacing[4] }}>
              <DepositActionPanel flow={depositFlow} vault={vault} />
              <WithdrawActionPanel flow={withdrawFlow} vault={vault} />
            </View>
          </View>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
