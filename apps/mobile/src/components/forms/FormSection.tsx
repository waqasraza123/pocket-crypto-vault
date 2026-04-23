import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";

import { spacing } from "../../theme";
import { AppHeading, AppText } from "../primitives";

export interface FormSectionProps {
  title: string;
  description?: string;
  aside?: ReactNode;
}

export const FormSection = ({
  title,
  description,
  aside,
  children,
}: PropsWithChildren<FormSectionProps>) => {
  return (
    <View style={{ gap: spacing[4] }}>
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="md">{title}</AppHeading>
        {description ? <AppText tone="secondary">{description}</AppText> : null}
      </View>
      {aside}
      <View style={{ gap: spacing[4] }}>{children}</View>
    </View>
  );
};
