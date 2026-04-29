import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { colors, radii, spacing } from "../../theme";
import { useI18n } from "../../lib/i18n";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { AppHeading, AppText } from "../primitives";

export interface FormSectionProps {
  title: string;
  description?: string;
  aside?: ReactNode;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  tone?: "accent" | "positive" | "warning";
}

export const FormSection = ({
  title,
  description,
  aside,
  icon = "shield-check-outline",
  tone = "accent",
  children,
}: PropsWithChildren<FormSectionProps>) => {
  const breakpoint = useBreakpoint();
  const { inlineDirection } = useI18n();
  const iconColor = tone === "positive" ? colors.positive : tone === "warning" ? colors.warning : colors.accentStrong;
  const iconBackgroundColor = tone === "positive" ? colors.positiveSoft : tone === "warning" ? colors.warningSoft : colors.accentSoft;

  return (
    <View style={{ gap: breakpoint.isCompact ? spacing[3] : spacing[4] }}>
      <View
        style={{
          flexDirection: inlineDirection(),
          alignItems: "flex-start",
          gap: spacing[3],
          borderRadius: breakpoint.isCompact ? 0 : radii.md,
          borderWidth: breakpoint.isCompact ? 0 : 1,
          borderColor: colors.borderStrong,
          backgroundColor: breakpoint.isCompact ? colors.background : colors.backgroundElevated,
          padding: breakpoint.isCompact ? 0 : spacing[4],
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radii.sm,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconBackgroundColor,
          }}
        >
          <MaterialCommunityIcons color={iconColor} name={icon} size={20} />
        </View>
        <View style={{ flex: 1, gap: spacing[2] }}>
          <AppHeading size={breakpoint.isCompact ? "sm" : "md"}>{title}</AppHeading>
          {description ? <AppText size={breakpoint.isCompact ? "sm" : "md"} tone="secondary">{description}</AppText> : null}
        </View>
      </View>
      {aside}
      <View style={{ gap: breakpoint.isCompact ? spacing[3] : spacing[4] }}>{children}</View>
    </View>
  );
};
