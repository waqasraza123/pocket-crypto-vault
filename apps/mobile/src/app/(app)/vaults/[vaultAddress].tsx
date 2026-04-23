import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { useVaultDetail } from "../../../hooks/useVaultDetail";
import { useWalletConnection } from "../../../hooks/useWalletConnection";
import { parseVaultRouteParams } from "../../../lib/validation";
import { useAdaptiveLayout } from "../../../hooks/useAdaptiveLayout";
import { spacing } from "../../../theme";
import { ChainDataLoadingState, DisconnectedState, StateBanner, UnsupportedNetworkNotice } from "../../../components/feedback";
import { ScreenHeader } from "../../../components/layout";
import { EmptyState, PageContainer, Screen } from "../../../components/primitives";
import {
  DepositPreviewCard,
  VaultActionPanel,
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

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="Vault Detail"
          title="One place for progress, rules, and next actions."
          description="This screen uses typed route params and mock detail data so contract and backend reads can replace the source later without changing the structure."
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

        {connectionState.status === "ready" && !isLoading && queryStatus !== "success" ? (
          <EmptyState
            description="The requested vault could not be resolved from the supported chain reads or the fallback dataset."
            icon="shield-star-outline"
            title="Vault not available"
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
              <VaultActionPanel vault={vault} />
              <DepositPreviewCard preview={vault.depositPreview} />
              <WithdrawNoticeCard withdrawEligibility={vault.withdrawEligibility} />
            </View>
          </View>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
