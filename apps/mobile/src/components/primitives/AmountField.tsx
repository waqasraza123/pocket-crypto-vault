import { forwardRef } from "react";
import { View, type TextInput } from "react-native";

import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import { AppText } from "./AppText";
import { TextField, type TextFieldProps } from "./TextField";

export interface AmountFieldProps extends Omit<TextFieldProps, "label"> {
  label?: string;
}

export const AmountField = forwardRef<TextInput, AmountFieldProps>(
  ({ label, helperText, placeholder, ...props }, ref) => {
    const { messages } = useI18n();

    return (
      <View style={{ gap: spacing[2] }}>
        <AppText size="sm" tone="secondary" weight="medium">
          {label ?? messages.pages.createVault.fields.targetAmount}
        </AppText>
        <TextField
          ref={ref}
          keyboardType="decimal-pad"
          label=""
          helperText={helperText ?? messages.pages.createVault.fields.targetAmountHelper}
          placeholder={placeholder ?? "2,500"}
          {...props}
        />
      </View>
    );
  },
);

AmountField.displayName = "AmountField";
