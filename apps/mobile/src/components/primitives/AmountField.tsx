import { forwardRef } from "react";
import { View, type TextInput } from "react-native";

import { spacing } from "../../theme";
import { AppText } from "./AppText";
import { TextField, type TextFieldProps } from "./TextField";

export interface AmountFieldProps extends Omit<TextFieldProps, "label"> {
  label?: string;
}

export const AmountField = forwardRef<TextInput, AmountFieldProps>(
  ({ label = "Target amount", helperText = "Use whole or decimal USDC amounts.", ...props }, ref) => {
    return (
      <View style={{ gap: spacing[2] }}>
        <AppText size="sm" tone="secondary" weight="medium">
          {label}
        </AppText>
        <TextField
          ref={ref}
          keyboardType="decimal-pad"
          label=""
          helperText={helperText}
          placeholder="2,500"
          {...props}
        />
      </View>
    );
  },
);

AmountField.displayName = "AmountField";
