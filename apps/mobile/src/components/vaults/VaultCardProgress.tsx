import { View } from "react-native";

import { formatProgress } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import { AppText, ProgressBar } from "../primitives";

export interface VaultCardProgressProps {
  progressRatio: number;
}

export const VaultCardProgress = ({ progressRatio }: VaultCardProgressProps) => {
  const { messages } = useI18n();

  return (
    <View style={{ gap: spacing[2] }}>
      <ProgressBar progress={progressRatio} tone={progressRatio >= 1 ? "positive" : "accent"} />
      <AppText size="sm" tone="muted">
        {formatProgress(progressRatio)} {messages.common.labels.funded}
      </AppText>
    </View>
  );
};
