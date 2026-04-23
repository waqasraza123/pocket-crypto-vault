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
}

export const EmptyState = ({
  title,
  description,
  icon = "bullseye-arrow",
}: EmptyStateProps) => {
  return (
    <SurfaceCard tone="muted" style={{ alignItems: "flex-start" }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentSoft,
        }}
      >
        <MaterialCommunityIcons color={colors.accentStrong} name={icon} size={24} />
      </View>
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="md">{title}</AppHeading>
        <AppText tone="secondary">{description}</AppText>
      </View>
    </SurfaceCard>
  );
};
