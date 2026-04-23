import { useRouter } from "expo-router";
import { View } from "react-native";

import type { VaultSummary } from "../../types";
import { routes } from "../../lib/routing";
import { spacing } from "../../theme";
import { AppHeading, AppText, SecondaryButton, SurfaceCard } from "../primitives";
import { VaultCardAmount } from "./VaultCardAmount";
import { VaultCardProgress } from "./VaultCardProgress";
import { VaultCardRule } from "./VaultCardRule";
import { VaultCardStatus } from "./VaultCardStatus";

export interface VaultCardProps {
  vault: VaultSummary;
}

export const VaultCard = ({ vault }: VaultCardProps) => {
  const router = useRouter();

  return (
    <SurfaceCard style={{ flex: 1, minWidth: 280 }}>
      <View style={{ gap: spacing[3] }}>
        <VaultCardStatus status={vault.status} />
        <View style={{ gap: spacing[1] }}>
          <AppHeading size="md">{vault.goalName}</AppHeading>
          {vault.note ? <AppText tone="secondary">{vault.note}</AppText> : null}
        </View>
      </View>
      <VaultCardAmount savedAmount={vault.savedAmount} targetAmount={vault.targetAmount} />
      <VaultCardProgress progressRatio={vault.progressRatio} />
      <VaultCardRule unlockDate={vault.unlockDate} />
      <SecondaryButton icon="arrow-right" label="Open vault" onPress={() => router.push(routes.vaultDetail(vault.address))} />
    </SurfaceCard>
  );
};
