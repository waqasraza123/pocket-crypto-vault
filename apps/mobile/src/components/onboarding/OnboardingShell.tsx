import type { PropsWithChildren, ReactNode } from "react";
import { Platform, ScrollView, View, useWindowDimensions, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, createShadowStyle, spacing } from "../../theme";

export interface OnboardingShellProps {
  footer?: ReactNode;
}

export const OnboardingShell = ({ children, footer }: PropsWithChildren<OnboardingShellProps>) => {
  const { height } = useWindowDimensions();
  const frameWidth = Platform.OS === "web" ? ("min(100vw, 430px)" as ViewStyle["width"]) : "100%";
  const isShortViewport = height > 0 && height < 760;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#061133" }}>
      <View style={{ flex: 1, alignItems: "center", backgroundColor: "#061133" }}>
        <View
          style={{
            flex: 1,
            width: frameWidth,
            maxWidth: 430,
            backgroundColor: "#07133d",
            overflow: "hidden",
            ...createShadowStyle({
              color: colors.textPrimary,
              opacity: Platform.OS === "web" ? 0.22 : 0,
              radius: 46,
              offsetY: 20,
              elevation: 0,
            }),
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -130,
              top: -120,
              width: 290,
              height: 210,
              borderRadius: 86,
              borderWidth: 2,
              borderColor: "rgba(170, 218, 255, 0.64)",
              backgroundColor: "rgba(37, 99, 235, 0.82)",
              transform: [{ rotate: "-8deg" }],
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -96,
              top: -96,
              width: 178,
              height: 178,
              borderRadius: 58,
              borderWidth: 2,
              borderColor: "rgba(170, 218, 255, 0.64)",
              backgroundColor: "rgba(96, 165, 250, 0.86)",
              transform: [{ rotate: "12deg" }],
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -80,
              right: -80,
              top: 214,
              height: 248,
              backgroundColor: "#1957ff",
              opacity: 0.96,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -120,
              right: -120,
              top: 352,
              height: 340,
              backgroundColor: "#061133",
              borderTopLeftRadius: 180,
              borderTopRightRadius: 180,
              opacity: 0.94,
            }}
          />
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: isShortViewport ? spacing[4] : spacing[5],
              paddingBottom: isShortViewport ? spacing[4] : spacing[5],
              paddingTop: isShortViewport ? spacing[3] : spacing[4],
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1, justifyContent: "space-between", gap: spacing[5] }}>{children}</View>
          </ScrollView>
          {footer}
        </View>
      </View>
    </SafeAreaView>
  );
};
