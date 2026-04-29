import type { ComponentProps } from "react";
import { View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useI18n } from "../../lib/i18n";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView } from "../primitives";

export const OnboardingPreviewCard = () => {
  const { height } = useWindowDimensions();
  const { inlineDirection, messages } = useI18n();
  const steps = messages.onboarding.previewSteps;
  const isShortViewport = height > 0 && height < 760;

  return (
    <MotionView
      delay={120}
      intensity="emphasis"
      preset="hero"
      style={{
        alignSelf: "center",
        width: "100%",
        maxWidth: 378,
        borderRadius: 42,
        borderWidth: 1,
        borderColor: "rgba(147, 197, 253, 0.82)",
        backgroundColor: "rgba(255, 255, 255, 0.18)",
        padding: spacing[3],
        ...createShadowStyle({
          color: colors.accentStrong,
          opacity: 0.34,
          radius: 36,
          offsetY: 18,
          elevation: 12,
        }),
      }}
    >
      <View
        style={{
          minHeight: isShortViewport ? 368 : 428,
          borderRadius: 34,
          backgroundColor: colors.white,
          paddingHorizontal: isShortViewport ? spacing[4] : spacing[5],
          paddingBottom: isShortViewport ? spacing[4] : spacing[5],
          paddingTop: isShortViewport ? spacing[3] : spacing[4],
          overflow: "hidden",
        }}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between" }}>
          <MaterialCommunityIcons color={colors.textPrimary} name="close" size={22} />
          <View style={{ flexDirection: inlineDirection(), gap: spacing[2] }}>
            {[0, 1, 2].map((item) => (
              <View
                key={item}
                style={{
                  width: item === 0 ? 18 : 48,
                  height: 4,
                  borderRadius: radii.pill,
                  backgroundColor: item === 0 ? colors.accent : colors.border,
                }}
              />
            ))}
          </View>
          <View style={{ width: 22 }} />
        </View>

        <View style={{ alignItems: "center", paddingTop: isShortViewport ? spacing[6] : spacing[12], paddingBottom: isShortViewport ? spacing[5] : spacing[10] }}>
          <View style={{ width: 132, height: 132, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                position: "absolute",
                top: 4,
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 12,
                borderColor: "#d5dbe5",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 18,
                width: 58,
                height: 58,
                borderRadius: 29,
                borderWidth: 4,
                borderColor: colors.textPrimary,
                backgroundColor: "#ffd42a",
              }}
            />
            <View style={{ position: "absolute", top: 68, width: 150, height: 40, backgroundColor: "#d1d5db" }} />
            <View
              style={{
                position: "absolute",
                top: 28,
                width: 100,
                height: 86,
                borderRadius: 4,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons color={colors.textPrimary} name="key-variant" size={26} />
            </View>
            <View style={{ position: "absolute", bottom: 12, width: 104, height: 12, backgroundColor: "rgba(37, 99, 235, 0.16)" }} />
          </View>
        </View>

        <View style={{ gap: spacing[4] }}>
          <AppHeading size="sm">{messages.onboarding.previewTitle}</AppHeading>
          <View style={{ gap: spacing[3] }}>
            {steps.map((step, index) => (
              <PreviewStep
                key={step.title}
                active={index === 1}
                description={step.description}
                icon={step.icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
                index={index + 1}
                title={step.title}
              />
            ))}
          </View>
        </View>
      </View>
    </MotionView>
  );
};

const PreviewStep = ({
  active,
  description,
  icon,
  index,
  title,
}: {
  active: boolean;
  description: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  index: number;
  title: string;
}) => {
  const { inlineDirection, textAlignEnd } = useI18n();

  if (active) {
    return (
      <View
        style={{
          marginHorizontal: -spacing[5],
          borderRadius: radii.pill,
          backgroundColor: colors.white,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          ...createShadowStyle({
            color: colors.textPrimary,
            opacity: 0.16,
            radius: 26,
            offsetY: 12,
            elevation: 9,
          }),
        }}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accent,
            }}
          >
            <AppText style={{ color: colors.white }} weight="bold">
              {index}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold">{title}</AppText>
            <AppText size="sm" tone="muted">
              {description}
            </AppText>
          </View>
          <AppText align={textAlignEnd} weight="bold">
            1 min
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: index === 1 ? colors.accent : colors.border,
        }}
      >
        {index === 1 ? (
          <MaterialCommunityIcons color={colors.white} name={icon} size={14} />
        ) : (
          <AppText size="sm" tone="muted" weight="bold">
            {index}
          </AppText>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <AppText weight="semibold">{title}</AppText>
        <AppText size="sm" tone="muted">
          {description}
        </AppText>
      </View>
      {index === 3 ? (
        <AppText align={textAlignEnd} size="sm" weight="bold">
          5 min
        </AppText>
      ) : null}
    </View>
  );
};
