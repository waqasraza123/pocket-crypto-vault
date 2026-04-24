import { View } from "react-native";

import { spacing } from "../../theme";
import { AppText, LoadingBlock, SurfaceCard } from "../primitives";
import { useI18n } from "../../lib/i18n";

export const ChainDataLoadingState = () => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <View style={{ gap: spacing[3] }}>
        <AppText size="sm" tone="accent" weight="semibold">
          {messages.feedback.syncingTitle}
        </AppText>
        <LoadingBlock height={14} width="35%" />
        <LoadingBlock height={28} width="60%" />
        <LoadingBlock height={14} width="90%" />
        <LoadingBlock height={14} width="75%" />
      </View>
    </SurfaceCard>
  );
};
