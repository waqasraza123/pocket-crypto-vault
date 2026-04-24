import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface StepPillsProps {
  currentStep: number;
  steps: string[];
}

export const StepPills = ({ currentStep, steps }: StepPillsProps) => {
  const { inlineDirection } = useI18n();

  return (
    <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        return (
          <View
            key={step}
            style={{
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
              borderRadius: radii.pill,
              backgroundColor: isActive ? colors.accentSoft : colors.surface,
              borderWidth: 1,
              borderColor: isActive ? colors.accent : colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing[2],
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: radii.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive ? colors.accentStrong : colors.surfaceMuted,
              }}
            >
              <AppText size="xs" style={{ color: isActive ? colors.white : colors.textSecondary }} weight="semibold">
                {index + 1}
              </AppText>
            </View>
            <AppText size="sm" style={{ color: isActive ? colors.accentStrong : colors.textSecondary }} weight="semibold">
              {step}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};
