import { View } from "react-native";

import type { VaultDetail } from "../../types";
import { formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import { AppHeading, AppText } from "../primitives";
import { VaultCardStatus } from "./VaultCardStatus";

export interface VaultDetailHeaderProps {
  vault: VaultDetail;
}

export const VaultDetailHeader = ({ vault }: VaultDetailHeaderProps) => {
  const { messages } = useI18n();

  return (
    <View style={{ gap: spacing[3] }}>
      <VaultCardStatus status={vault.status} />
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="xl">{vault.goalName}</AppHeading>
        {vault.note ? <AppText tone="secondary">{vault.note}</AppText> : null}
      </View>
      <AppText size="lg" weight="semibold">
        {interpolate(messages.vaults.detailSaved, { amount: formatUsdc(vault.savedAmount) })}
      </AppText>
    </View>
  );
};
