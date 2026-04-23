import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { useVaultDepositFlow } from "../../../hooks/useVaultDepositFlow";
import { useVaultDetail } from "../../../hooks/useVaultDetail";
import { useWalletConnection } from "../../../hooks/useWalletConnection";
import { useI18n } from "../../../lib/i18n";
import { parseVaultRouteParams } from "../../../lib/validation";
import { useAdaptiveLayout } from "../../../hooks/useAdaptiveLayout";
import { spacing } from "../../../theme";
import {
  ChainDataLoadingState,
  DisconnectedState,
  MetadataRecoveryNotice,
  StateBanner,
  UnsupportedNetworkNotice,
} from "../../../components/feedback";
import { ScreenHeader } from "../../../components/layout";
import { EmptyState, PageContainer, Screen } from "../../../components/primitives";
import {
  DepositActionPanel,
  VaultActivityPreview,
  VaultDetailHeader,
  VaultProgressPanel,
  VaultRulePanel,
  WithdrawNoticeCard,
} from "../../../components/vaults";

export default function VaultDetailScreen() {
  const params = useLocalSearchParams();
  const { vaultAddress } = parseVaultRouteParams(params);
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { dataSource, isLoading, notice, queryStatus, vault } = useVaultDetail(vaultAddress);
  const adaptiveLayout = useAdaptiveLayout();
  const { messages } = useI18n();
  const depositFlow = useVaultDepositFlow(vault);

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
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
          <UnsupportedNetworkNotice onSwitch={() => void switchNetwork()} />
        ) : null}

        {connectionState.status === "ready" && isLoading ? <ChainDataLoadingState /> : null}

        {notice && connectionState.status === "ready" ? (
          <StateBanner
            icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
            label={notice}
            tone={dataSource === "fallback" ? "warning" : "neutral"}
          />
        ) : null}

        {vault?.metadataStatus === "failed" ? (
          <MetadataRecoveryNotice
            description="This vault is active onchain, but its display details still need to be saved from the create flow."
            title="Vault active"
          />
        ) : null}

        {vault?.metadataStatus === "pending" ? (
          <MetadataRecoveryNotice
            description="This vault is active onchain. Goal details are still syncing into the app."
            title="Vault active"
          />
        ) : null}

        {connectionState.status === "ready" && !isLoading && queryStatus !== "success" ? (
          <EmptyState
            description={messages.pages.vaultDetail.notAvailableDescription}
            icon="shield-star-outline"
            title={messages.pages.vaultDetail.notAvailableTitle}
          />
        ) : null}

        {vault ? <VaultDetailHeader vault={vault} /> : null}

        {vault ? (
          <View style={{ flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column", gap: spacing[4] }}>
            <View style={{ flex: 1, gap: spacing[4] }}>
              <VaultProgressPanel vault={vault} />
              <VaultRulePanel vault={vault} />
              <VaultActivityPreview events={vault.activityPreview} />
            </View>
            <View style={{ flex: 1, gap: spacing[4] }}>
              <DepositActionPanel flow={depositFlow} vault={vault} />
              <WithdrawNoticeCard withdrawEligibility={vault.withdrawEligibility} />
            </View>
          </View>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
