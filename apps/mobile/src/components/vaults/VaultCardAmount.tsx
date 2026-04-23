import { View } from "react-native";

import { formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { AppText } from "../primitives";

export interface VaultCardAmountProps {
  savedAmount: number;
  targetAmount: number;
}

export const VaultCardAmount = ({ savedAmount, targetAmount }: VaultCardAmountProps) => {
  const { messages } = useI18n();

  return (
    <View style={{ gap: 4 }}>
      <AppText size="xl" weight="semibold">
        {formatUsdc(savedAmount)}
      </AppText>
      <AppText size="sm" tone="muted">
        {messages.common.labels.of} {formatUsdc(targetAmount)}
      </AppText>
    </View>
  );
};
