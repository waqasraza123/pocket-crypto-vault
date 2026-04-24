import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { colors } from "../../theme";
import { AppFooter } from "./AppFooter";
import { TopNavigation } from "./TopNavigation";

export const MarketingShell = ({ children }: PropsWithChildren) => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopNavigation area="marketing" />
      <View style={{ flex: 1, overflow: "hidden" }}>
        <View
          style={{
            position: "absolute",
            top: -140,
            right: -60,
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: colors.accentSoft,
            opacity: 0.65,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -180,
            left: -80,
            width: 340,
            height: 340,
            borderRadius: 170,
            backgroundColor: colors.surfaceStrong,
            opacity: 0.7,
          }}
        />
        <View style={{ flex: 1 }}>{children}</View>
      </View>
      <AppFooter />
    </View>
  );
};
