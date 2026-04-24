import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, spacing } from "../../theme";
import { AppHeading } from "./AppHeading";
import { AppText } from "./AppText";
import { SurfaceCard } from "./SurfaceCard";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  eyebrow?: string;
  highlights?: string[];
}

export const EmptyState = ({
  children,
  title,
  description,
  icon = "bullseye-arrow",
  eyebrow,
  highlights = [],
}: PropsWithChildren<EmptyStateProps>) => {
  return (
    <SurfaceCard tone="muted" style={{ alignItems: "flex-start", overflow: "hidden" }}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentSoft,
        }}
      >
        <MaterialCommunityIcons color={colors.accentStrong} name={icon} size={28} />
      </View>
      <View style={{ gap: spacing[2] }}>
        {eyebrow ? (
          <AppText size="sm" tone="accent" weight="semibold">
            {eyebrow}
          </AppText>
        ) : null}
        <AppHeading size="md">{title}</AppHeading>
        <AppText tone="secondary">{description}</AppText>
      </View>
      {highlights.length > 0 ? (
        <View style={{ gap: spacing[2] }}>
          {highlights.map((highlight) => (
            <AppText key={highlight} size="sm" tone="secondary">
              • {highlight}
            </AppText>
          ))}
        </View>
      ) : null}
      {children}
    </SurfaceCard>
  );
};
