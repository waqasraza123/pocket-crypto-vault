import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { onboardingPalette, spacing } from "../../theme";

export interface OnboardingShellProps {
  footer?: ReactNode;
}

export const OnboardingShell = ({ children, footer }: PropsWithChildren<OnboardingShellProps>) => {
  const { height, width } = useWindowDimensions();
  const isShortViewport = height > 0 && height < 760;
  const isCompact = width < 768;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: onboardingPalette.canvas }}>
      <View style={{ flex: 1, backgroundColor: onboardingPalette.canvas }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: isCompact ? -120 : -80,
            top: isCompact ? 220 : -160,
            width: isCompact ? 240 : 420,
            height: isCompact ? 240 : 420,
            borderRadius: isCompact ? 120 : 210,
            borderWidth: 1,
            borderColor: onboardingPalette.border,
            opacity: 0.7,
          }}
        />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 1180,
            alignSelf: "center",
            paddingHorizontal: isCompact ? spacing[5] : spacing[10],
            paddingBottom: isShortViewport ? spacing[5] : spacing[8],
            paddingTop: isShortViewport ? spacing[4] : spacing[6],
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, gap: isCompact ? spacing[8] : spacing[12] }}>{children}</View>
        </ScrollView>
        {footer}
      </View>
    </SafeAreaView>
  );
};
