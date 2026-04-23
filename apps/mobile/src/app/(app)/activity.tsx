import { View } from "react-native";

import { mockActivity } from "../../features/activity/mockActivity";
import { colors, radii, spacing } from "../../theme";
import { ScreenHeader } from "../../components/layout";
import { AppText, PageContainer, Screen, SurfaceCard } from "../../components/primitives";

export default function ActivityScreen() {
  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="reading" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="Activity"
          title="Every vault movement in one calm timeline."
          description="Event indexing comes later. The screen structure is already ready for merged onchain and metadata activity."
        />
        <View style={{ gap: spacing[4] }}>
          {mockActivity.map((event) => (
            <SurfaceCard key={event.id}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing[4] }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: radii.pill,
                    backgroundColor: colors.accent,
                    marginTop: 8,
                  }}
                />
                <View style={{ flex: 1, gap: spacing[1] }}>
                  <AppText weight="semibold">{event.title}</AppText>
                  <AppText tone="secondary">{event.subtitle}</AppText>
                  <AppText size="sm" tone="muted">
                    {new Date(event.occurredAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </AppText>
                </View>
              </View>
            </SurfaceCard>
          ))}
        </View>
      </PageContainer>
    </Screen>
  );
}
