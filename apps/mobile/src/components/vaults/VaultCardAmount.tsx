import { View } from "react-native";

import { formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { AnimatedNumberText, AppText } from "../primitives";

export interface VaultCardAmountProps {
  savedAmount: number;
  targetAmount: number;
}

export const VaultCardAmount = ({ savedAmount, targetAmount }: VaultCardAmountProps) => {
  const { messages } = useI18n();

  return (
    <View style={{ gap: 4 }}>
      <AppText size="sm" tone="secondary">
        {messages.common.labels.totalSaved}
      </AppText>
      <AnimatedNumberText formatValue={formatUsdc} size="xl" value={savedAmount} weight="semibold" />
      <AppText size="sm" tone="muted">
        {messages.common.labels.of} {formatUsdc(targetAmount)}
      </AppText>
    </View>
  );
};
