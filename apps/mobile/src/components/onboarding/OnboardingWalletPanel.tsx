import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { AppConnectionState } from "@pocket-vault/shared";

import { useI18n, type AppMessages } from "../../lib/i18n";
import { colors, createShadowStyle, onboardingPalette, radii, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface OnboardingWalletPanelProps {
  connectionState: AppConnectionState;
  mode: "createAccount" | "signIn";
  onPrimary: () => void;
  onSecondary: () => void;
}

export const OnboardingWalletPanel = ({ connectionState, mode, onPrimary, onSecondary }: OnboardingWalletPanelProps) => {
  const { getDirectionalIcon, inlineDirection, messages } = useI18n();
  const copy = mode === "signIn" ? messages.onboarding.signIn : messages.onboarding.createAccount;
  const statusCopy = getStatusCopy(connectionState, messages);
  const primaryLabel =
    connectionState.status === "ready"
      ? copy.readyAction
      : connectionState.status === "unsupportedNetwork"
        ? messages.common.buttons.switchNetwork
        : connectionState.status === "connecting"
          ? messages.common.buttons.connecting
          : messages.common.buttons.connectWallet;
  const primaryIcon =
    connectionState.status === "ready"
      ? "arrow-right"
      : connectionState.status === "unsupportedNetwork"
        ? "swap-horizontal"
        : connectionState.status === "connecting"
          ? "timer-sand"
          : "wallet-outline";
  const isPrimaryDisabled = connectionState.status === "connecting";

  return (
    <View
      style={{
        borderRadius: 28,
        borderWidth: 1,
        borderColor: onboardingPalette.border,
        backgroundColor: onboardingPalette.surface,
        padding: spacing[6],
        gap: spacing[5],
        ...createShadowStyle({
          color: onboardingPalette.ink,
          opacity: 0.1,
          radius: 30,
          offsetY: 16,
          elevation: 7,
        }),
      }}
    >
      <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: onboardingPalette.surfaceMuted,
          }}
        >
          <MaterialCommunityIcons color={onboardingPalette.ink} name={copy.icon as ComponentProps<typeof MaterialCommunityIcons>["name"]} size={24} />
        </View>
        <View style={{ flex: 1, gap: spacing[1] }}>
          <AppText size="sm" style={{ color: onboardingPalette.accentStrong }} weight="bold">
            {copy.eyebrow}
          </AppText>
          <AppText style={{ color: onboardingPalette.ink }} weight="bold">{copy.panelTitle}</AppText>
        </View>
      </View>

      <View style={{ gap: spacing[2] }}>
        <AppText style={{ color: onboardingPalette.text }}>{copy.panelDescription}</AppText>
        <View
          style={{
            flexDirection: inlineDirection(),
            alignItems: "center",
            gap: spacing[2],
            borderRadius: radii.lg,
            backgroundColor: statusCopy.backgroundColor,
            padding: spacing[3],
          }}
        >
          <MaterialCommunityIcons color={statusCopy.iconColor} name={statusCopy.icon} size={18} />
          <AppText style={{ flex: 1, color: statusCopy.textColor }} size="sm" weight="semibold">
            {statusCopy.label}
          </AppText>
        </View>
      </View>

      <View style={{ gap: spacing[3] }}>
        <Pressable
          accessibilityRole="button"
          disabled={isPrimaryDisabled}
          onPress={onPrimary}
          style={({ pressed }) => ({
            minHeight: 56,
            borderRadius: radii.lg,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isPrimaryDisabled
              ? onboardingPalette.borderStrong
              : pressed
                ? onboardingPalette.accentStrong
                : onboardingPalette.ink,
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[4],
          })}
        >
          <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
            <MaterialCommunityIcons color={onboardingPalette.white} name={getDirectionalIcon(primaryIcon)} size={19} />
            <AppText style={{ color: onboardingPalette.white }} weight="bold">
              {primaryLabel}
            </AppText>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onSecondary} style={{ alignItems: "center", paddingVertical: spacing[2] }}>
          <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
            <MaterialCommunityIcons color={onboardingPalette.ink} name={getDirectionalIcon("arrow-left")} size={17} />
            <AppText style={{ color: onboardingPalette.ink }} weight="semibold">
              {messages.onboarding.actions.backToStart}
            </AppText>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const getStatusCopy = (connectionState: AppConnectionState, messages: AppMessages) => {
  if (connectionState.status === "ready") {
    return {
      label: messages.onboarding.status.ready,
      icon: "check-circle-outline" as const,
      iconColor: onboardingPalette.accent,
      textColor: onboardingPalette.ink,
      backgroundColor: onboardingPalette.accentSoft,
    };
  }

  if (connectionState.status === "unsupportedNetwork") {
    return {
      label: messages.onboarding.status.unsupported,
      icon: "alert-circle-outline" as const,
      iconColor: colors.warning,
      textColor: onboardingPalette.ink,
      backgroundColor: colors.warningSoft,
    };
  }

  if (connectionState.status === "connecting") {
    return {
      label: messages.onboarding.status.connecting,
      icon: "timer-sand" as const,
      iconColor: onboardingPalette.muted,
      textColor: onboardingPalette.ink,
      backgroundColor: onboardingPalette.surfaceMuted,
    };
  }

  if (connectionState.status === "walletUnavailable") {
    return {
      label: messages.onboarding.status.unavailable,
      icon: "wallet-outline" as const,
      iconColor: onboardingPalette.muted,
      textColor: onboardingPalette.text,
      backgroundColor: onboardingPalette.surfaceMuted,
    };
  }

  return {
    label: messages.onboarding.status.disconnected,
    icon: "wallet-outline" as const,
    iconColor: onboardingPalette.muted,
    textColor: onboardingPalette.ink,
    backgroundColor: onboardingPalette.surfaceMuted,
  };
};
