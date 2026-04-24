import { View } from "react-native";

import { colors, radii, spacing } from "../../theme";
import { AppText } from "./AppText";

const toneMap = {
  active: { backgroundColor: colors.accentSoft, textColor: colors.accentStrong, glowColor: colors.accentGlow },
  locked: { backgroundColor: colors.warningSoft, textColor: colors.warning, glowColor: colors.warningSoft },
  unlocked: { backgroundColor: colors.positiveSoft, textColor: colors.positive, glowColor: colors.positiveGlow },
  closed: { backgroundColor: colors.surfaceStrong, textColor: colors.textSecondary, glowColor: colors.surfaceMuted },
  danger: { backgroundColor: colors.dangerSoft, textColor: colors.danger, glowColor: colors.dangerSoft },
} as const;

export interface StatusChipProps {
  label: string;
  tone?: keyof typeof toneMap;
}

export const StatusChip = ({ label, tone = "active" }: StatusChipProps) => {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: toneMap[tone].textColor,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        backgroundColor: toneMap[tone].backgroundColor,
        shadowColor: toneMap[tone].glowColor,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 1,
      }}
    >
      <AppText size="sm" style={{ color: toneMap[tone].textColor }} weight="semibold">
        {label}
      </AppText>
    </View>
  );
};
