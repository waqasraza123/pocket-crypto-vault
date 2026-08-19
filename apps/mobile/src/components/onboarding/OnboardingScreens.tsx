import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

import { productConfig } from "@pocket-vault/config";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { createConnectionAnalyticsContext, useScreenTracking } from "../../lib/analytics";
import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { onboardingPalette, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView } from "../primitives";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { OnboardingActionButtons } from "./OnboardingActionButtons";
import { OnboardingPreviewCard } from "./OnboardingPreviewCard";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingWalletPanel } from "./OnboardingWalletPanel";

export const OnboardingLandingScreen = () => {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const { connectionState } = useWalletConnection();
  const { inlineDirection, messages } = useI18n();

  useScreenTracking(
    "landing_viewed",
    {
      entry: connectionState.status === "ready" ? "returning" : "direct",
    },
    `native-onboarding:${connectionState.status}`,
    createConnectionAnalyticsContext(connectionState),
  );

  return (
    <OnboardingShell>
      <Stack.Screen options={{ title: productConfig.shortName }} />
      <OnboardingHeader />
      <View
        style={{
          flex: 1,
          flexDirection: breakpoint.isCompact ? "column" : inlineDirection(),
          alignItems: breakpoint.isCompact ? "stretch" : "center",
          justifyContent: "space-between",
          gap: breakpoint.isCompact ? spacing[8] : spacing[16],
        }}
      >
        <MotionView
          preset="hero"
          intensity="emphasis"
          style={{ flex: breakpoint.isCompact ? undefined : 0.9, maxWidth: breakpoint.isCompact ? undefined : 520, gap: spacing[6] }}
        >
          <View style={{ gap: spacing[4] }}>
            <View
              style={{
                alignSelf: "flex-start",
                borderRadius: radii.pill,
                backgroundColor: onboardingPalette.accentSoft,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[2],
              }}
            >
              <AppText size="xs" style={{ color: onboardingPalette.accentStrong, letterSpacing: 0.8 }} weight="bold">
                {messages.onboarding.landing.eyebrow}
              </AppText>
            </View>
            <AppHeading
              size="lg"
              style={{
                color: onboardingPalette.ink,
                fontSize: breakpoint.isCompact ? 40 : breakpoint.isExpanded ? 58 : 48,
                lineHeight: breakpoint.isCompact ? 46 : breakpoint.isExpanded ? 64 : 55,
              }}
            >
              {messages.onboarding.landing.title}
            </AppHeading>
            <AppText size={breakpoint.isCompact ? "md" : "lg"} style={{ color: onboardingPalette.text }}>
              {messages.onboarding.landing.description}
            </AppText>
          </View>

          <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
            {messages.onboarding.landing.highlights.map((highlight, index) => (
              <View
                key={highlight}
                style={{
                  flexDirection: inlineDirection(),
                  alignItems: "center",
                  gap: spacing[2],
                  borderRadius: radii.pill,
                  borderWidth: 1,
                  borderColor: onboardingPalette.border,
                  backgroundColor: onboardingPalette.surface,
                  paddingHorizontal: spacing[3],
                  paddingVertical: spacing[2],
                }}
              >
                <MaterialCommunityIcons
                  color={index === 0 ? onboardingPalette.accent : onboardingPalette.ink}
                  name={index === 0 ? "shield-check-outline" : index === 1 ? "currency-usd" : "cube-outline"}
                  size={16}
                />
                <AppText size="sm" style={{ color: onboardingPalette.text }} weight="semibold">
                  {highlight}
                </AppText>
              </View>
            ))}
          </View>

          <OnboardingActionButtons
            onCreateAccount={() => router.push(routes.createAccount)}
            onSignIn={() => router.push(routes.signIn)}
          />
        </MotionView>

        <View style={{ flex: breakpoint.isCompact ? undefined : 1.1, width: "100%", maxWidth: 540 }}>
          <OnboardingPreviewCard />
        </View>
      </View>
    </OnboardingShell>
  );
};

export const OnboardingWalletEntryScreen = ({ mode }: { mode: "createAccount" | "signIn" }) => {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { getDirectionalIcon, inlineDirection, messages } = useI18n();
  const copy = mode === "signIn" ? messages.onboarding.signIn : messages.onboarding.createAccount;
  const readyRoute = mode === "signIn" ? routes.appHome : routes.createVault;

  useScreenTracking(
    "landing_viewed",
    {
      entry: connectionState.status === "ready" ? "returning" : "direct",
    },
    `native-onboarding:${mode}:${connectionState.status}`,
    createConnectionAnalyticsContext(connectionState),
  );

  useEffect(() => {
    if (connectionState.status === "ready") {
      router.replace(readyRoute);
    }
  }, [connectionState.status, readyRoute, router]);

  const handlePrimary = async () => {
    if (connectionState.status === "ready") {
      router.replace(readyRoute);
      return;
    }

    if (connectionState.status === "unsupportedNetwork") {
      await switchNetwork();
      return;
    }

    if (connectionState.status === "disconnected" || connectionState.status === "walletUnavailable") {
      await connect();
    }
  };

  return (
    <OnboardingShell>
      <Stack.Screen options={{ title: copy.title }} />
      <OnboardingHeader />
      <View
        style={{
          flex: 1,
          flexDirection: breakpoint.isCompact ? "column" : inlineDirection(),
          alignItems: breakpoint.isCompact ? "stretch" : "center",
          justifyContent: "space-between",
          gap: breakpoint.isCompact ? spacing[8] : spacing[16],
        }}
      >
        <MotionView
          preset="hero"
          intensity="emphasis"
          style={{ flex: breakpoint.isCompact ? undefined : 0.9, maxWidth: breakpoint.isCompact ? undefined : 500, gap: spacing[6] }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(routes.landing)}
            style={({ pressed }) => ({
              alignSelf: "flex-start",
              flexDirection: inlineDirection(),
              alignItems: "center",
              gap: spacing[2],
              borderRadius: radii.pill,
              backgroundColor: pressed ? onboardingPalette.surfaceStrong : onboardingPalette.surface,
              borderWidth: 1,
              borderColor: onboardingPalette.border,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
            })}
          >
            <MaterialCommunityIcons color={onboardingPalette.ink} name={getDirectionalIcon("arrow-left")} size={17} />
            <AppText size="sm" style={{ color: onboardingPalette.ink }} weight="semibold">
              {messages.onboarding.actions.backToStart}
            </AppText>
          </Pressable>

          <View style={{ gap: spacing[4] }}>
            <AppText size="xs" style={{ color: onboardingPalette.accentStrong, letterSpacing: 0.8 }} weight="bold">
              {copy.eyebrow}
            </AppText>
            <AppHeading
              size="lg"
              style={{
                color: onboardingPalette.ink,
                fontSize: breakpoint.isCompact ? 38 : 50,
                lineHeight: breakpoint.isCompact ? 44 : 57,
              }}
            >
              {copy.title}
            </AppHeading>
            <AppText size={breakpoint.isCompact ? "md" : "lg"} style={{ color: onboardingPalette.text }}>
              {copy.description}
            </AppText>
          </View>

          <View style={{ gap: spacing[3] }}>
            {copy.highlights.map((highlight) => (
              <View key={highlight} style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: onboardingPalette.accentSoft,
                  }}
                >
                  <MaterialCommunityIcons color={onboardingPalette.accentStrong} name="check" size={16} />
                </View>
                <AppText style={{ flex: 1, color: onboardingPalette.text }} weight="semibold">
                  {highlight}
                </AppText>
              </View>
            ))}
          </View>
        </MotionView>

        <View style={{ flex: breakpoint.isCompact ? undefined : 1, width: "100%", maxWidth: 500 }}>
          <OnboardingWalletPanel
            connectionState={connectionState}
            mode={mode}
            onPrimary={() => void handlePrimary()}
            onSecondary={() => router.replace(routes.landing)}
          />
        </View>
      </View>
    </OnboardingShell>
  );
};

const OnboardingHeader = () => {
  const { inlineDirection } = useI18n();

  return (
    <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between", gap: spacing[3] }}>
      <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: onboardingPalette.ink,
          }}
        >
          <MaterialCommunityIcons color={onboardingPalette.white} name="shield-lock-outline" size={21} />
        </View>
        <AppText style={{ color: onboardingPalette.ink }} weight="bold">
          {productConfig.shortName}
        </AppText>
      </View>
      <LanguageSwitcher appearance="monochrome" compact />
    </View>
  );
};
