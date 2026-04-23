import { forwardRef } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing, typography } from "../../theme";
import { AppText } from "./AppText";

export interface TextFieldProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorMessage?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, helperText, errorMessage, multiline, style, ...props }, ref) => {
    const { direction, textAlignStart } = useI18n();

    return (
      <View style={{ gap: spacing[2] }}>
        {label ? (
          <AppText size="sm" tone="secondary" weight="medium">
            {label}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          style={[
            {
              minHeight: multiline ? 124 : 52,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: errorMessage ? colors.danger : colors.border,
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[4],
              fontSize: typography.size.md,
              lineHeight: typography.lineHeight.md,
              textAlign: textAlignStart,
              textAlignVertical: multiline ? "top" : "center",
              writingDirection: direction,
            },
            style,
          ]}
          {...props}
        />
        {errorMessage ? (
          <AppText size="sm" tone="danger">
            {errorMessage}
          </AppText>
        ) : helperText ? (
          <AppText size="sm" tone="muted">
            {helperText}
          </AppText>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = "TextField";
