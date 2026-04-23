import { View } from "react-native";

import { productConfig } from "@goal-vault/config";

import { useI18n } from "../../lib/i18n";
import { colors, spacing } from "../../theme";
import { AppText, PageContainer } from "../primitives";

export const AppFooter = () => {
  const { messages } = useI18n();

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.backgroundElevated }}>
      <PageContainer style={{ paddingVertical: spacing[4] }}>
        <AppText size="sm" tone="muted">
          {messages.footer.description.replace("Goal Vault", productConfig.name)}
        </AppText>
      </PageContainer>
    </View>
  );
};
