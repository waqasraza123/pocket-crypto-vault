import { useRouter } from "expo-router";
import { View } from "react-native";

import { getUnlockedVaultCount, getTotalSaved } from "../../features/vault-list/selectors";
import { formatUsdc } from "../../lib/format";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useVaults } from "../../hooks/useVaults";
import { ChainDataLoadingState, DisconnectedState, StateBanner, UnsupportedNetworkNotice } from "../../components/feedback";
import { ScreenHeader } from "../../components/layout";
import { AppHeading, AppText, EmptyState, PageContainer, PrimaryButton, Screen, SurfaceCard } from "../../components/primitives";
import { VaultGrid } from "../../components/vaults";

export default function MyVaultsScreen() {
  const router = useRouter();
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { dataSource, isLoading, notice, queryStatus, vaults } = useVaults();
  const totalSaved = getTotalSaved(vaults);
  const unlockedCount = getUnlockedVaultCount(vaults);

  const showVaultGrid = connectionState.status === "ready" && !isLoading && queryStatus === "success";

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="My Vaults"
          title="Protect the money meant for something real."
          description="A calm view of progress, rules, and upcoming withdrawal eligibility."
          action={<PrimaryButton icon="plus" label="Create vault" onPress={() => router.push(routes.createVault)} />}
        />

        {connectionState.status === "walletUnavailable" || connectionState.status === "disconnected" ? (
          <DisconnectedState onConnect={() => void connect()} />
        ) : null}

        {connectionState.status === "unsupportedNetwork" ? (
          <UnsupportedNetworkNotice
            label={connectionState.session?.chainId ? `Chain ${connectionState.session.chainId}` : null}
            onSwitch={() => void switchNetwork()}
          />
        ) : null}

        {connectionState.status === "ready" && isLoading ? <ChainDataLoadingState /> : null}

        {notice && connectionState.status === "ready" ? (
          <StateBanner
            icon={dataSource === "fallback" ? "database-clock-outline" : "information-outline"}
            label={notice}
            tone={dataSource === "fallback" ? "warning" : "neutral"}
          />
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[4] }}>
          <SurfaceCard style={{ flex: 1, minWidth: 220 }}>
            <AppText tone="secondary">Total saved</AppText>
            <AppHeading size="xl">{formatUsdc(totalSaved)}</AppHeading>
          </SurfaceCard>
          <SurfaceCard style={{ flex: 1, minWidth: 220 }}>
            <AppText tone="secondary">Vault count</AppText>
            <AppHeading size="xl">{vaults.length}</AppHeading>
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

        {connectionState.status === "ready" && !isLoading && queryStatus === "empty" ? (
          <EmptyState
            description="Create your first vault in the next phase once onchain write flows land. The app is already connected and reading the supported network."
            title="No vaults yet"
          />
        ) : null}

        {showVaultGrid ? <VaultGrid vaults={vaults} /> : null}
      </PageContainer>
    </Screen>
  );
}
