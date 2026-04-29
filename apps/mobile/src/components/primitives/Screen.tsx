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

import { useBreakpoint } from "../../hooks/useBreakpoint";
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
  const breakpoint = useBreakpoint();
  const content = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
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
        <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}>
          {breakpoint.isCompact ? null : (
            <>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 320,
                  backgroundColor: colors.surfaceMuted,
                  opacity: 0.58,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: colors.white,
                  opacity: 0.86,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 92,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: colors.border,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 96,
                  left: "8%",
                  width: 260,
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: colors.accent,
                  opacity: 0.2,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 96,
                  left: "32%",
                  width: 92,
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: colors.positive,
                  opacity: 0.22,
                }}
              />
            </>
          )}
        </View>
        {header}
        {content}
        {footer}
      </View>
    </SafeAreaView>
  );
};
