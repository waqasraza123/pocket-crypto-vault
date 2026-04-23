import { View } from "react-native";

import { colors, radii, spacing } from "../../theme";
import { AppText } from "./AppText";

const toneMap = {
  active: { backgroundColor: colors.accentSoft, textColor: colors.accentStrong },
  locked: { backgroundColor: colors.warningSoft, textColor: colors.warning },
  unlocked: { backgroundColor: colors.positiveSoft, textColor: colors.positive },
  closed: { backgroundColor: colors.surfaceStrong, textColor: colors.textSecondary },
  danger: { backgroundColor: colors.dangerSoft, textColor: colors.danger },
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
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        backgroundColor: toneMap[tone].backgroundColor,
      }}
    >
      <AppText size="sm" style={{ color: toneMap[tone].textColor }} weight="semibold">
        {label}
      </AppText>
    </View>
  );
};
