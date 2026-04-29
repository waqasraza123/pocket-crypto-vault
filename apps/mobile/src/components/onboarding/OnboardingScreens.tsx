import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

import { productConfig } from "@pocket-vault/config";

import { useWalletConnection } from "../../hooks/useWalletConnection";
import { createConnectionAnalyticsContext, useScreenTracking } from "../../lib/analytics";
import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView } from "../primitives";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { OnboardingActionButtons } from "./OnboardingActionButtons";
import { OnboardingPreviewCard } from "./OnboardingPreviewCard";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingWalletPanel } from "./OnboardingWalletPanel";

export const OnboardingLandingScreen = () => {
  const router = useRouter();
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
      <View style={{ gap: spacing[5] }}>
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between", gap: spacing[3] }}>
          <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.white,
              }}
            >
              <MaterialCommunityIcons color={colors.accentStrong} name="shield-lock-outline" size={21} />
            </View>
            <AppText style={{ color: colors.white }} weight="bold">
              {productConfig.shortName}
            </AppText>
          </View>
          <LanguageSwitcher compact />
        </View>

        <MotionView preset="hero" intensity="emphasis" style={{ alignItems: "center", paddingTop: spacing[2], gap: spacing[3] }}>
          <AppText align="center" size="xs" style={{ color: "#bfdbfe", letterSpacing: 1.2 }} weight="bold">
            {messages.onboarding.landing.eyebrow}
          </AppText>
          <AppHeading align="center" size="lg" style={{ color: colors.white, fontSize: 35, lineHeight: 41 }}>
            {messages.onboarding.landing.title}
          </AppHeading>
          <AppText align="center" style={{ color: "#dbeafe" }}>
            {messages.onboarding.landing.description}
          </AppText>
        </MotionView>
      </View>

      <View style={{ gap: spacing[5] }}>
        <OnboardingPreviewCard />
        <OnboardingActionButtons
          onCreateAccount={() => router.push(routes.createAccount)}
          onSignIn={() => router.push(routes.signIn)}
        />
      </View>
    </OnboardingShell>
  );
};

export const OnboardingWalletEntryScreen = ({ mode }: { mode: "createAccount" | "signIn" }) => {
  const router = useRouter();
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
      <View style={{ gap: spacing[5] }}>
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between", gap: spacing[3] }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(routes.landing)}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? "rgba(255, 255, 255, 0.22)" : "rgba(255, 255, 255, 0.14)",
            })}
          >
            <MaterialCommunityIcons color={colors.white} name={getDirectionalIcon("arrow-left")} size={21} />
          </Pressable>
          <LanguageSwitcher compact />
        </View>

        <MotionView preset="hero" intensity="emphasis" style={{ gap: spacing[3], paddingTop: spacing[3] }}>
          <AppText size="xs" style={{ color: "#bfdbfe", letterSpacing: 1.2 }} weight="bold">
            {copy.eyebrow}
          </AppText>
          <AppHeading size="lg" style={{ color: colors.white, fontSize: 35, lineHeight: 41 }}>
            {copy.title}
          </AppHeading>
          <AppText style={{ color: "#dbeafe" }}>{copy.description}</AppText>
        </MotionView>
      </View>

      <View style={{ gap: spacing[5] }}>
        <View
          style={{
            borderRadius: 32,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.22)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: spacing[4],
            gap: spacing[3],
          }}
        >
          {copy.highlights.map((highlight) => (
            <View key={highlight} style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radii.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                }}
              >
                <MaterialCommunityIcons color="#bfdbfe" name="check" size={16} />
              </View>
              <AppText style={{ flex: 1, color: colors.white }} weight="semibold">
                {highlight}
              </AppText>
            </View>
          ))}
        </View>

        <OnboardingWalletPanel
          connectionState={connectionState}
          mode={mode}
          onPrimary={() => void handlePrimary()}
          onSecondary={() => router.replace(routes.landing)}
        />
      </View>
    </OnboardingShell>
  );
};
