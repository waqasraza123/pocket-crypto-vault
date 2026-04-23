import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { getMockVaultDetail } from "../../../features/vault-detail/mockVaultDetail";
import { parseVaultRouteParams } from "../../../lib/validation";
import { useAdaptiveLayout } from "../../../hooks/useAdaptiveLayout";
import { spacing } from "../../../theme";
import { ScreenHeader } from "../../../components/layout";
import { PageContainer, Screen } from "../../../components/primitives";
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
  const vault = getMockVaultDetail(vaultAddress);
  const adaptiveLayout = useAdaptiveLayout();

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="Vault Detail"
          title="One place for progress, rules, and next actions."
          description="This screen uses typed route params and mock detail data so contract and backend reads can replace the source later without changing the structure."
        />
        <VaultDetailHeader vault={vault} />

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
      </PageContainer>
    </Screen>
  );
}
