import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { spacing } from "../../theme";
import { PageContainer } from "../primitives";
import { AppFooter } from "./AppFooter";
import { TopNavigation } from "./TopNavigation";
import { WalletStatusCard } from "./WalletStatusCard";

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <View style={{ flex: 1 }}>
      <TopNavigation area="app" />
      <PageContainer width="dashboard" style={{ paddingTop: spacing[4] }}>
        <WalletStatusCard />
      </PageContainer>
      <View style={{ flex: 1 }}>{children}</View>
      <AppFooter />
    </View>
  );
};
