import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SurfaceCard } from "../primitives";

export interface GuidedStepsCardProps {
  title: string;
  description: string;
  steps: string[];
  eyebrow?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const GuidedStepsCard = ({
  children,
  title,
  description,
  steps,
  eyebrow,
  icon = "compass-outline",
}: PropsWithChildren<GuidedStepsCardProps>) => {
  return (
    <SurfaceCard tone="muted" style={{ backgroundColor: colors.backgroundElevated }}>
      <View style={{ gap: spacing[4] }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing[3] }}>
          <MotionView preset="scale" intensity="emphasis">
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.accentSoft,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                shadowColor: colors.accentGlow,
                shadowOpacity: 0.24,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 3,
              }}
            >
              <MaterialCommunityIcons color={colors.accentStrong} name={icon} size={24} />
            </View>
          </MotionView>
          <MotionView delay={70} style={{ flex: 1, gap: spacing[2] }}>
            {eyebrow ? (
              <AppText size="sm" tone="accent" weight="semibold">
                {eyebrow}
              </AppText>
            ) : null}
            <AppHeading size="md">{title}</AppHeading>
            <AppText tone="secondary">{description}</AppText>
          </MotionView>
        </View>
        <View style={{ gap: spacing[3] }}>
          {steps.map((step, index) => (
            <MotionView
              key={step}
              delay={120 + index * 55}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: spacing[3],
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: spacing[4],
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accentSoft,
                }}
              >
                <AppText size="sm" tone="accent" weight="semibold">
                  {index + 1}
                </AppText>
              </View>
              <AppText style={{ flex: 1 }} tone="secondary">
                {step}
              </AppText>
            </MotionView>
          ))}
        </View>
        {children}
      </View>
    </SurfaceCard>
  );
};
