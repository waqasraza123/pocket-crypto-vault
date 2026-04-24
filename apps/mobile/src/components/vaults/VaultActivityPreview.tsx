import { View } from "react-native";

import type { VaultActivityEvent } from "../../types";
import { getStaggerDelay } from "../../lib/motion/list-motion";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SecondaryButton, SurfaceCard } from "../primitives";

export interface VaultActivityPreviewProps {
  events: VaultActivityEvent[];
  onOpenTimeline?: () => void;
}

export const VaultActivityPreview = ({ events, onOpenTimeline }: VaultActivityPreviewProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing[3] }}>
        <AppHeading size="md">{messages.common.labels.recentActivity}</AppHeading>
        {onOpenTimeline ? (
          <SecondaryButton icon="arrow-right" label={messages.common.buttons.openActivity} onPress={onOpenTimeline} />
        ) : null}
      </View>
      {events.length === 0 ? (
        <AppText tone="secondary">{messages.vaults.activityEmpty}</AppText>
      ) : (
        <View style={{ gap: spacing[4] }}>
          {events.map((event, index) => (
            <MotionView key={event.id} delay={getStaggerDelay(index)} style={{ flexDirection: "row", gap: spacing[3] }}>
              <View
                style={{
                  width: 12,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: radii.pill,
                    backgroundColor: colors.accent,
                    marginTop: 6,
                  }}
                />
              </View>
              <View style={{ flex: 1, gap: spacing[1] }}>
                <AppText weight="semibold">{event.title}</AppText>
                <AppText tone="secondary">{event.subtitle}</AppText>
                <AppText size="sm" tone="muted">
                  {new Date(event.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </AppText>
              </View>
            </MotionView>
          ))}
        </View>
      )}
    </SurfaceCard>
  );
};
