import { Pressable, TextInput, View } from "react-native";

import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing, typography } from "../../theme";
import { AppText } from "../primitives";

export const DepositAmountField = ({
  value,
  onChangeText,
  onPressMax,
  balanceLabel,
  helperText,
  errorMessage,
  disabled,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onPressMax: () => void;
  balanceLabel: string;
  helperText?: string | null;
  errorMessage?: string | null;
  disabled?: boolean;
}) => {
  const { inlineDirection, messages, textAlignStart } = useI18n();

  return (
    <View style={{ gap: spacing[2] }}>
      <View style={{ flexDirection: inlineDirection(), justifyContent: "space-between", alignItems: "center", gap: spacing[3] }}>
        <AppText size="sm" tone="secondary" weight="medium">
          {messages.common.labels.depositAmount}
        </AppText>
        <AppText size="sm" tone="secondary">
          {balanceLabel}
        </AppText>
      </View>
      <View
        style={{
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: errorMessage ? colors.danger : colors.border,
          backgroundColor: disabled ? colors.surfaceMuted : colors.surface,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          gap: spacing[3],
        }}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
          <TextInput
            editable={!disabled}
            keyboardType="decimal-pad"
            onChangeText={onChangeText}
            placeholder="250"
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: typography.size.lg,
              lineHeight: typography.lineHeight.lg,
              fontFamily: typography.fontFamily.body,
              fontWeight: typography.weight.semibold,
              textAlign: textAlignStart,
              writingDirection: "auto",
            }}
            value={value}
          />
          <AppText tone="secondary" weight="semibold">
            USDC
          </AppText>
        </View>
        <View style={{ flexDirection: inlineDirection(), justifyContent: "space-between", alignItems: "center", gap: spacing[3] }}>
          <AppText size="sm" style={{ flex: 1 }} tone={errorMessage ? "danger" : "muted"}>
            {errorMessage ?? helperText ?? messages.deposit.amountHelper}
          </AppText>
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={onPressMax}
            style={({ pressed }) => ({
              borderRadius: radii.pill,
              backgroundColor: disabled ? colors.surfaceStrong : pressed ? colors.surfaceStrong : colors.surfaceMuted,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
            })}
          >
            <AppText size="sm" weight="semibold">
              {messages.common.buttons.max}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
