import type { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../theme";

export interface ScreenProps {
  scroll?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: ("top" | "right" | "bottom" | "left")[];
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
}

export const Screen = ({
  children,
  scroll = true,
  header,
  footer,
  contentContainerStyle,
  edges = ["top", "left", "right"],
  keyboardShouldPersistTaps = "handled",
}: PropsWithChildren<ScreenProps>) => {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <View
            style={{
              position: "absolute",
              top: -84,
              right: -52,
              width: 240,
              height: 240,
              borderRadius: 120,
              backgroundColor: colors.heroGlowPrimary,
              opacity: 0.34,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 180,
              left: -78,
              width: 188,
              height: 188,
              borderRadius: 94,
              backgroundColor: colors.heroGlowSecondary,
              opacity: 0.26,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -56,
              right: 24,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: colors.canvasGlow,
              opacity: 0.44,
            }}
          />
        </View>
        {header}
        {content}
        {footer}
      </View>
    </SafeAreaView>
  );
};
