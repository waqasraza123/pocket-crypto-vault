import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { AppFooter } from "./AppFooter";
import { TopNavigation } from "./TopNavigation";

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <View style={{ flex: 1 }}>
      <TopNavigation area="app" />
      <View style={{ flex: 1 }}>{children}</View>
      <AppFooter />
    </View>
  );
};
