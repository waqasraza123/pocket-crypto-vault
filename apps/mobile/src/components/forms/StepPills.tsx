import { View } from "react-native";

import { colors, radii, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface StepPillsProps {
  currentStep: number;
  steps: string[];
}

export const StepPills = ({ currentStep, steps }: StepPillsProps) => {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
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
            }}
          >
            <AppText size="sm" style={{ color: isActive ? colors.accentStrong : colors.textSecondary }} weight="semibold">
              {step}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};
