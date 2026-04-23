import { View } from "react-native";

import { productConfig } from "@goal-vault/config";

import { colors, spacing } from "../../theme";
import { AppText, PageContainer } from "../primitives";

export const AppFooter = () => {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.backgroundElevated }}>
      <PageContainer style={{ paddingVertical: spacing[4] }}>
        <AppText size="sm" tone="muted">
          {productConfig.name} is a calm USDC savings shell for Base. Wallet, contract, and API wiring land in later phases.
        </AppText>
      </PageContainer>
    </View>
  );
};
