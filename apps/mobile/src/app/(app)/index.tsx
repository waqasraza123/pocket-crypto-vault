import { useRouter } from "expo-router";
import { View } from "react-native";

import { getUnlockedVaultCount, getTotalSaved } from "../../features/vault-list/selectors";
import { mockVaults } from "../../features/vault-list/mockVaults";
import { formatUsdc } from "../../lib/format";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { UnsupportedNetworkCard } from "../../components/feedback";
import { ScreenHeader } from "../../components/layout";
import { AppHeading, AppText, PageContainer, PrimaryButton, Screen, SurfaceCard } from "../../components/primitives";
import { VaultGrid } from "../../components/vaults";

export default function MyVaultsScreen() {
  const router = useRouter();
  const totalSaved = getTotalSaved(mockVaults);
  const unlockedCount = getUnlockedVaultCount(mockVaults);

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="My Vaults"
          title="Protect the money meant for something real."
          description="A calm view of progress, rules, and upcoming withdrawal eligibility."
          action={<PrimaryButton icon="plus" label="Create vault" onPress={() => router.push(routes.createVault)} />}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
          <SurfaceCard style={{ flex: 1, minWidth: 220 }}>
            <AppText tone="secondary">Total saved</AppText>
            <AppHeading size="xl">{formatUsdc(totalSaved)}</AppHeading>
          </SurfaceCard>
          <SurfaceCard style={{ flex: 1, minWidth: 220 }}>
            <AppText tone="secondary">Vault count</AppText>
            <AppHeading size="xl">{mockVaults.length}</AppHeading>
          </SurfaceCard>
          <SurfaceCard tone="muted" style={{ flex: 1, minWidth: 220, backgroundColor: colors.accentSoft }}>
            <AppText tone="secondary">Eligible soon</AppText>
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
                Withdraw when eligible
              </AppText>
            </View>
          </SurfaceCard>
        </View>

        <UnsupportedNetworkCard />
        <VaultGrid vaults={mockVaults} />
      </PageContainer>
    </Screen>
  );
}
