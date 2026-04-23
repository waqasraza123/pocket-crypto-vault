import { View } from "react-native";

import { formatUsdc } from "../../lib/format";
import { AppText } from "../primitives";

export interface VaultCardAmountProps {
  savedAmount: number;
  targetAmount: number;
}

export const VaultCardAmount = ({ savedAmount, targetAmount }: VaultCardAmountProps) => {
  return (
    <View style={{ gap: 4 }}>
      <AppText size="xl" weight="semibold">
        {formatUsdc(savedAmount)}
      </AppText>
      <AppText size="sm" tone="muted">
        of {formatUsdc(targetAmount)}
      </AppText>
    </View>
  );
};
