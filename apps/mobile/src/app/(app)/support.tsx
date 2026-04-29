import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, usePathname } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import {
  supportRequestCategories,
  supportRequestPriorities,
  type SupportRequestCategory,
  type SupportRequestPriority,
} from "@pocket-vault/shared";

import { FeedbackStatusCard, StateBanner } from "../../components/feedback";
import { ScreenHeader } from "../../components/layout";
import {
  AppHeading,
  AppText,
  PageContainer,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SurfaceCard,
  TextField,
} from "../../components/primitives";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { submitSupportRequest } from "../../lib/api/support";
import { getBackendBaseUrl, envDiagnostics } from "../../lib/env/client";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";

const supportSecretPattern = /\b(private key|seed phrase|mnemonic|recovery phrase)\b/i;

const supportCategoryIcons: Record<SupportRequestCategory, ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
  transaction: "swap-horizontal-circle-outline",
  vault_data: "database-search-outline",
  wallet: "wallet-outline",
  access: "account-lock-outline",
  security: "shield-alert-outline",
  feedback: "message-text-outline",
  other: "lifebuoy",
};

export default function SupportScreen() {
  const pathname = usePathname();
  const breakpoint = useBreakpoint();
  const { connectionState } = useWalletConnection();
  const { formatMessage, inlineDirection, messages } = useI18n();
  const [category, setCategory] = useState<SupportRequestCategory>("transaction");
  const [priority, setPriority] = useState<SupportRequestPriority>("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const backendBaseUrl = getBackendBaseUrl();
  const chainId = connectionState.session?.chainId === 8453 || connectionState.session?.chainId === 84532 ? connectionState.session.chainId : null;
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  const trimmedContactEmail = contactEmail.trim();
  const contactEmailIsValid = !trimmedContactEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContactEmail);
  const subjectError = trimmedSubject.length > 0 && trimmedSubject.length < 4 ? messages.pages.support.validationSubject : undefined;
  const messageError = trimmedMessage.length > 0 && trimmedMessage.length < 20 ? messages.pages.support.validationMessage : undefined;
  const contactError = contactEmailIsValid ? undefined : messages.pages.support.validationContact;
  const containsSecretLikeContent = supportSecretPattern.test(`${trimmedSubject} ${trimmedMessage} ${trimmedContactEmail}`);
  const canSubmit =
    status !== "submitting" &&
    trimmedSubject.length >= 4 &&
    trimmedMessage.length >= 20 &&
    contactEmailIsValid &&
    !containsSecretLikeContent;
  const contextRows = useMemo(
    () => [
      [messages.pages.support.contextLabels.route, pathname],
      [messages.pages.support.contextLabels.environment, envDiagnostics.environment],
      [messages.pages.support.contextLabels.target, envDiagnostics.deploymentTarget],
      [messages.pages.support.contextLabels.wallet, connectionState.status],
      [messages.pages.support.contextLabels.address, connectionState.session?.address ?? messages.pages.support.noWalletAddress],
    ],
    [
      connectionState.session?.address,
      connectionState.status,
      messages.pages.support.contextLabels,
      messages.pages.support.noWalletAddress,
      pathname,
    ],
  );

  const handleSubmit = async () => {
    if (!canSubmit) {
      setErrorMessage(containsSecretLikeContent ? messages.pages.support.secretWarning : messages.pages.support.validationMessage);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const response = await submitSupportRequest({
      category,
      priority,
      subject: trimmedSubject,
      message: trimmedMessage,
      reporterWallet: connectionState.session?.address ?? null,
      contactEmail: trimmedContactEmail || null,
      context: {
        route: pathname,
        environment: envDiagnostics.environment,
        deploymentTarget: envDiagnostics.deploymentTarget,
        chainId,
        walletStatus: connectionState.status,
        vaultAddress: null,
      },
    });

    if (response.status === "success" && response.data) {
      setSubmittedId(response.data.id);
      setStatus("success");
      setSubject("");
      setMessage("");
      setContactEmail("");
      return;
    }

    setStatus("error");
    setErrorMessage(response.message ?? messages.pages.support.unavailableDescription);
  };

  return (
    <Screen
      contentContainerStyle={{ paddingBottom: breakpoint.isCompact ? spacing[6] : spacing[12] }}
      edges={breakpoint.isCompact ? ["left", "right"] : undefined}
    >
      <Stack.Screen options={{ title: messages.pages.support.title }} />
      <PageContainer width="reading" style={{ gap: breakpoint.isCompact ? spacing[5] : spacing[8], paddingTop: breakpoint.isCompact ? spacing[4] : spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.support.eyebrow}
          title={messages.pages.support.title}
          description={messages.pages.support.description}
        />
        {!backendBaseUrl ? (
          <FeedbackStatusCard
            title={messages.pages.support.unavailableTitle}
            description={messages.pages.support.unavailableDescription}
            icon="cloud-alert-outline"
            tone="warning"
          />
        ) : null}
        {status === "success" && submittedId ? (
          <FeedbackStatusCard
            title={messages.pages.support.successTitle}
            description={formatMessage(messages.pages.support.successDescription, { id: submittedId })}
            icon="check-circle-outline"
            tone="positive"
          >
            <SecondaryButton icon="plus" label={messages.common.buttons.submitSupport} onPress={() => setStatus("idle")} />
          </FeedbackStatusCard>
        ) : null}
        {status === "error" && errorMessage ? <StateBanner icon="alert-circle-outline" label={errorMessage} tone="warning" /> : null}
        {containsSecretLikeContent ? (
          <StateBanner icon="shield-alert-outline" label={messages.pages.support.secretWarning} tone="warning" />
        ) : null}
        <SurfaceCard tone="accent" style={{ padding: breakpoint.isCompact ? spacing[4] : spacing[5] }}>
          <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: radii.md,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.accentSoft,
                borderWidth: 1,
                borderColor: colors.accentStrong,
              }}
            >
              <MaterialCommunityIcons color={colors.accentStrong} name="lifebuoy" size={24} />
            </View>
            <View style={{ flex: 1, gap: spacing[2] }}>
              <AppHeading size="md">{messages.pages.support.intakeTitle}</AppHeading>
              <AppText tone="secondary">{messages.pages.support.intakeDescription}</AppText>
            </View>
          </View>
          <View style={{ gap: spacing[3] }}>
            <AppText size="sm" tone="secondary" weight="medium">
              {messages.pages.support.categoryLabel}
            </AppText>
            <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
              {supportRequestCategories.map((option) => {
                const isSelected = option === category;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setCategory(option)}
                    style={({ pressed }) => ({
                      flexDirection: inlineDirection(),
                      alignItems: "center",
                      gap: spacing[2],
                      borderRadius: radii.md,
                      borderWidth: 1,
                      borderColor: isSelected || pressed ? colors.accentStrong : colors.borderStrong,
                      backgroundColor: isSelected ? colors.accentSoft : pressed ? colors.surfaceStrong : colors.surface,
                      paddingHorizontal: spacing[3],
                      paddingVertical: spacing[2],
                    })}
                  >
                    <MaterialCommunityIcons
                      color={isSelected ? colors.accentStrong : colors.textSecondary}
                      name={supportCategoryIcons[option]}
                      size={17}
                    />
                    <AppText size="sm" style={isSelected ? { color: colors.accentStrong } : undefined} weight="semibold">
                      {messages.pages.support.categories[option]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={{ gap: spacing[3] }}>
            <AppText size="sm" tone="secondary" weight="medium">
              {messages.pages.support.priorityLabel}
            </AppText>
            <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
              {supportRequestPriorities.map((option) => {
                const isSelected = option === priority;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setPriority(option)}
                    style={({ pressed }) => ({
                      borderRadius: radii.md,
                      borderWidth: 1,
                      borderColor: isSelected || pressed ? colors.accentStrong : colors.borderStrong,
                      backgroundColor: isSelected ? colors.accentSoft : pressed ? colors.surfaceStrong : colors.surface,
                      paddingHorizontal: spacing[4],
                      paddingVertical: spacing[2],
                    })}
                  >
                    <AppText size="sm" style={isSelected ? { color: colors.accentStrong } : undefined} weight="semibold">
                      {messages.pages.support.priorities[option]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <TextField
            label={messages.pages.support.subjectLabel}
            placeholder={messages.pages.support.subjectPlaceholder}
            value={subject}
            onChangeText={setSubject}
            errorMessage={subjectError}
            maxLength={120}
          />
          <TextField
            label={messages.pages.support.messageLabel}
            placeholder={messages.pages.support.messagePlaceholder}
            value={message}
            onChangeText={setMessage}
            errorMessage={messageError}
            maxLength={2_000}
            multiline
          />
          <TextField
            label={messages.pages.support.contactLabel}
            placeholder={messages.pages.support.contactPlaceholder}
            helperText={messages.pages.support.contactHelper}
            errorMessage={contactError}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PrimaryButton
            fullWidth={breakpoint.isCompact}
            icon="send"
            label={status === "submitting" ? messages.common.buttons.submitting : messages.common.buttons.submitSupport}
            disabled={!canSubmit || !backendBaseUrl}
            onPress={() => void handleSubmit()}
          />
        </SurfaceCard>
        <SurfaceCard tone="muted" style={{ padding: breakpoint.isCompact ? spacing[4] : spacing[5] }}>
          <View style={{ gap: spacing[2] }}>
            <AppHeading size="sm">{messages.pages.support.walletContextTitle}</AppHeading>
            <AppText tone="secondary">{messages.pages.support.walletContextDescription}</AppText>
          </View>
          <View style={{ gap: spacing[2] }}>
            {contextRows.map(([label, value]) => (
              <View key={label} style={{ flexDirection: inlineDirection(), justifyContent: "space-between", gap: spacing[3] }}>
                <AppText size="sm" tone="muted">
                  {label}
                </AppText>
                <AppText numberOfLines={1} size="sm" weight="semibold">
                  {value}
                </AppText>
              </View>
            ))}
          </View>
        </SurfaceCard>
      </PageContainer>
    </Screen>
  );
}
