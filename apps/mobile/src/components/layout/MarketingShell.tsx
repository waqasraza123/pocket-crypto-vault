import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { AppFooter } from "./AppFooter";
import { TopNavigation } from "./TopNavigation";

export const MarketingShell = ({ children }: PropsWithChildren) => {
  return (
    <View style={{ flex: 1 }}>
      <TopNavigation area="marketing" />
      <View style={{ flex: 1 }}>{children}</View>
      <AppFooter />
    </View>
  );
};
