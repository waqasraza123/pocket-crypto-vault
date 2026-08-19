import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { colors, radii, spacing } from "../../theme";
import { AppText, MotionView, StatusPulse } from "../primitives";

export interface StepPillsProps {
  currentStep: number;
  steps: string[];
}

export const StepPills = ({ currentStep, steps }: StepPillsProps) => {
  const breakpoint = useBreakpoint();
  const { inlineDirection } = useI18n();

  return (
    <View style={{ flexDirection: inlineDirection(), flexWrap: breakpoint.isCompact ? "nowrap" : "wrap", gap: spacing[2] }}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        const indicatorBackground = isActive ? colors.accentStrong : isComplete ? colors.positive : colors.surfaceMuted;
        const indicatorTextColor = isActive || isComplete ? colors.white : colors.textSecondary;
        const pillBackground = isActive ? colors.accentSoft : isComplete ? colors.positiveSoft : colors.surface;
        const pillBorder = isActive ? colors.accent : isComplete ? colors.positive : colors.border;
        const labelColor = isActive ? colors.accentStrong : isComplete ? colors.positive : colors.textSecondary;

        return (
          <MotionView
            key={step}
            delay={index * 35}
            intensity={isActive ? "structural" : "subtle"}
            preset="scale"
            style={{
              flex: breakpoint.isCompact ? 1 : undefined,
              minHeight: breakpoint.isCompact ? 38 : 42,
              paddingHorizontal: breakpoint.isCompact ? spacing[2] : spacing[3],
              paddingVertical: spacing[2],
              borderRadius: radii.pill,
              backgroundColor: pillBackground,
              borderWidth: 1,
              borderColor: pillBorder,
              flexDirection: inlineDirection(),
              alignItems: "center",
              gap: spacing[2],
            }}
          >
            <StatusPulse active={isActive}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: radii.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: indicatorBackground,
                }}
              >
                {isComplete ? (
                  <MaterialCommunityIcons color={colors.white} name="check" size={14} />
                ) : (
                  <AppText size="xs" style={{ color: indicatorTextColor }} weight="semibold">
                    {index + 1}
                  </AppText>
                )}
              </View>
            </StatusPulse>
            <AppText numberOfLines={1} size="sm" style={{ color: labelColor }} weight="semibold">
              {step}
            </AppText>
          </MotionView>
        );
      })}
    </View>
  );
};
