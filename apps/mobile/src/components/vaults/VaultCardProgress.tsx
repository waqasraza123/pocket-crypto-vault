import { View } from "react-native";

import { formatProgress } from "../../lib/format";
import { spacing } from "../../theme";
import { AppText, ProgressBar } from "../primitives";

export interface VaultCardProgressProps {
  progressRatio: number;
}

export const VaultCardProgress = ({ progressRatio }: VaultCardProgressProps) => {
  return (
    <View style={{ gap: spacing[2] }}>
      <ProgressBar progress={progressRatio} />
      <AppText size="sm" tone="muted">
        {formatProgress(progressRatio)} funded
      </AppText>
    </View>
  );
};
