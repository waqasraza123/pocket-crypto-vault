import { View } from "react-native";

import type { VaultActivityEvent } from "../../types";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface VaultActivityPreviewProps {
  events: VaultActivityEvent[];
}

export const VaultActivityPreview = ({ events }: VaultActivityPreviewProps) => {
  return (
    <SurfaceCard>
      <AppHeading size="md">Recent activity</AppHeading>
      <View style={{ gap: 16 }}>
        {events.map((event) => (
          <View key={event.id} style={{ gap: 4 }}>
            <AppText weight="semibold">{event.title}</AppText>
            <AppText tone="secondary">{event.subtitle}</AppText>
            <AppText size="sm" tone="muted">
              {new Date(event.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </AppText>
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
};
