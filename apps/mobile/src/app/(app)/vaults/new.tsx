import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { useCreateVaultForm } from "../../../features/create-vault/useCreateVaultForm";
import { useAppReadiness } from "../../../hooks/useAppReadiness";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useWalletConnection } from "../../../hooks/useWalletConnection";
import { useCreateVaultMutation } from "../../../hooks/useCreateVaultMutation";
import { useTransactionRecovery } from "../../../hooks/useTransactionRecovery";
import { useContractConfig } from "../../../hooks/useContractConfig";
import { defaultGoalVaultChainId } from "../../../lib/blockchain/chains";
import { createConnectionAnalyticsContext, getAmountBucket, getUnlockLeadDaysBucket, useScreenTracking } from "../../../lib/analytics";
import { buildCreateVaultReviewModel, getVaultAccentThemeOptions } from "../../../lib/contracts/mappers";
import { interpolate, useI18n } from "../../../lib/i18n";
import { routes } from "../../../lib/routing";
import { colors, radii, spacing } from "../../../theme";
import { useAnalytics } from "../../../hooks/useAnalytics";
import { FormSection, StepPills } from "../../../components/forms";
import { MobileActionBar, ScreenHeader } from "../../../components/layout";
import {
  ConfigurationNotice,
  CreateVaultErrorState,
  DisconnectedState,
  MetadataRecoveryNotice,
  StateBanner,
  TransactionRecoveryNotice,
  TransactionStatusCard,
} from "../../../components/feedback";
import { NetworkStatusBanner } from "../../../components/layout/NetworkStatusBanner";
import {
  AmountField,
  AppText,
  MotionPressable,
  MotionView,
  PageContainer,
  PrimaryButton,
  Screen,
  SecondaryButton,
  TextField,
} from "../../../components/primitives";
import { CreateVaultPreviewCard, CreateVaultReviewPanel, CreateVaultSuccessCard } from "../../../components/vaults";

export default function CreateVaultScreen() {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const { inlineDirection, messages } = useI18n();
  const { track } = useAnalytics();
  const { values, errors, step, setFieldValue, nextStep, previousStep, validateAll, reset } = useCreateVaultForm();
  const { chainId, config } = useContractConfig();
  const { readiness } = useAppReadiness();
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { items, dismiss } = useTransactionRecovery({
    ownerAddress: connectionState.session?.address ?? null,
  });
  const { state, statusCopy, result, submit, retry, reset: resetMutation, isBusy } = useCreateVaultMutation();
  const targetAmount = Number.parseFloat(values.targetAmount || "0");
  const stepLabels = messages.pages.createVault.steps;
  const accentThemeOptions = useMemo(() => getVaultAccentThemeOptions(), [messages.pages.createVault.accentThemes]);
  const ruleOptions = [
    {
      value: "timeLock",
      label: "Time Lock",
      icon: "calendar-lock-outline",
      description: messages.pages.createVault.timeLockDescription,
    },
    {
      value: "cooldownUnlock",
      label: "Cooldown Unlock",
      icon: "timer-sand",
      description: "Request unlock first, then wait through the cooldown.",
    },
    {
      value: "guardianApproval",
      label: "Guardian Approval",
      icon: "account-supervisor-circle-outline",
      description: "Require a guardian wallet to approve withdrawal readiness.",
    },
  ] satisfies Array<{
    value: typeof values.ruleType;
    label: string;
    icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
    description: string;
  }>;
  const createRecovery = items.find((item) => item.kind === "create_vault") ?? null;

  const activeChainId = connectionState.session?.chain?.id ?? chainId ?? defaultGoalVaultChainId;
  const review = useMemo(() => {
    try {
      return buildCreateVaultReviewModel({
        chainId: activeChainId,
        values,
      });
    } catch {
      return null;
    }
  }, [activeChainId, values]);

  const factoryConfigured = Boolean(config?.goalVaultFactoryAddress);
  const showGoalStep = step === 0;
  const showRuleStep = step === 1;
  const showReviewStep = step === 2;
  const canSubmit = connectionState.status === "ready" && factoryConfigured && Boolean(review) && !isBusy;
  const stepTrackingRef = useRef<Set<number>>(new Set());
  const analyticsContext = useMemo(
    () => createConnectionAnalyticsContext(connectionState),
    [connectionState],
  );

  useScreenTracking(
    "create_vault_started",
    {
      entry: "dashboard",
    },
    "create-vault",
    analyticsContext,
  );

  useEffect(() => {
    if (stepTrackingRef.current.has(step)) {
      return;
    }

    stepTrackingRef.current.add(step);
    track(
      "create_vault_step_progressed",
      {
        stepIndex: step,
        stepName: stepLabels[step] ?? `step_${step}`,
      },
      analyticsContext,
    );
  }, [analyticsContext, step, stepLabels, track]);

  const handleCreate = async () => {
    const isValid = validateAll();

    if (!isValid) {
      return;
    }

    if (connectionState.status !== "ready") {
      if (connectionState.status === "disconnected" || connectionState.status === "walletUnavailable") {
        await connect();
        return;
      }

      if (connectionState.status === "unsupportedNetwork") {
        await switchNetwork();
      }

      return;
    }

    track(
      "create_vault_submitted",
      {
        hasCategory: Boolean(values.category.trim()),
        hasNote: Boolean(values.note.trim()),
        targetAmountBucket: getAmountBucket(Number.parseFloat(values.targetAmount || "0")),
        unlockLeadDaysBucket: getUnlockLeadDaysBucket(values.unlockDate),
      },
      analyticsContext,
    );
    await submit(values);
  };

  const handleResetFlow = () => {
    reset();
    resetMutation();
  };

  const handleViewVault = () => {
    if (result?.vaultAddress) {
      router.replace(routes.vaultDetail(result.vaultAddress));
    }
  };

  const handleBackToVaults = () => {
    router.replace(routes.appHome);
  };

  const renderStepActions = (fullWidth = false) => (
    <View style={{ flexDirection: fullWidth ? "column" : inlineDirection(), flexWrap: fullWidth ? "nowrap" : "wrap", gap: spacing[3] }}>
      {step > 0 ? (
        <SecondaryButton disabled={isBusy} fullWidth={fullWidth} icon="arrow-left" label={messages.common.buttons.back} onPress={previousStep} />
      ) : null}
      {step < 2 ? (
        <PrimaryButton disabled={isBusy} fullWidth={fullWidth} icon="arrow-right" label={messages.common.buttons.continue} onPress={nextStep} />
      ) : connectionState.status === "disconnected" || connectionState.status === "walletUnavailable" ? (
        <PrimaryButton
          disabled={isBusy}
          fullWidth={fullWidth}
          icon="wallet-outline"
          label={messages.common.buttons.connectWallet}
          onPress={() => void connect()}
        />
      ) : connectionState.status === "unsupportedNetwork" ? (
        <PrimaryButton
          disabled={isBusy}
          fullWidth={fullWidth}
          icon="swap-horizontal"
          label={interpolate(messages.wallet.switchToChain, { chain: messages.common.networkBase })}
          onPress={() => void switchNetwork()}
        />
      ) : (
        <PrimaryButton
          disabled={!canSubmit || readiness.status === "blocked"}
          fullWidth={fullWidth}
          icon="shield-check-outline"
          label={messages.common.buttons.createVault}
          onPress={() => void handleCreate()}
        />
      )}
    </View>
  );

  return (
    <Screen
      contentContainerStyle={{ paddingBottom: breakpoint.isCompact ? spacing[6] : spacing[12] }}
      edges={breakpoint.isCompact ? ["left", "right"] : undefined}
      footer={breakpoint.isCompact && state.status !== "success" ? <MobileActionBar>{renderStepActions(true)}</MobileActionBar> : undefined}
      keyboardShouldPersistTaps="always"
    >
      <Stack.Screen options={{ title: messages.pages.createVault.title }} />
      <PageContainer width="dashboard" style={{ gap: breakpoint.isCompact ? spacing[5] : spacing[8], paddingTop: breakpoint.isCompact ? spacing[4] : spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.createVault.eyebrow}
          title={messages.pages.createVault.title}
          description={messages.pages.createVault.description}
          action={breakpoint.isCompact ? undefined : <SecondaryButton icon="arrow-left" label={messages.common.buttons.backToVaults} onPress={handleBackToVaults} />}
        />

        <StateBanner
          icon="shield-lock-outline"
          label={messages.pages.createVault.stateBanner}
        />

        {connectionState.status === "walletUnavailable" || connectionState.status === "disconnected" ? (
          <DisconnectedState onConnect={() => void connect()} />
        ) : null}

        {connectionState.status === "unsupportedNetwork" ? (
          <NetworkStatusBanner
            label={connectionState.session?.chainId ? `Chain ${connectionState.session.chainId}` : null}
            onSwitch={() => void switchNetwork()}
          />
        ) : null}

        {connectionState.status === "ready" && (!factoryConfigured || readiness.configurationStatus === "invalid") ? (
          <ConfigurationNotice description={!factoryConfigured ? messages.pages.createVault.missingFactory : undefined} />
        ) : null}

        {createRecovery ? <TransactionRecoveryNotice item={createRecovery} onDismiss={() => void dismiss(createRecovery.id)} /> : null}

        {state.status !== "idle" && state.status !== "success" ? (
          <TransactionStatusCard
            description={statusCopy.description}
            details={[
              ...(state.txHash ? [{ label: messages.common.labels.transactionHash, value: state.txHash }] : []),
              ...(state.vaultAddress ? [{ label: messages.common.labels.vaultAddress, value: state.vaultAddress }] : []),
            ]}
            title={statusCopy.title}
            tone={state.status === "failed" ? "muted" : "accent"}
          />
        ) : null}

        {state.status === "failed" && state.didOnchainSucceed && result ? (
          <MetadataRecoveryNotice
            description={state.errorMessage ?? messages.feedback.metadataFailedDescription}
            onRetry={() => void retry()}
            onViewVault={handleViewVault}
            title={messages.feedback.metadataLiveTitle}
          />
        ) : null}

        {state.status === "failed" && (!state.didOnchainSucceed || !result) ? (
          <CreateVaultErrorState onReset={handleResetFlow} onRetry={() => void retry()} state={state} />
        ) : null}

        {state.status === "success" && result ? (
          <CreateVaultSuccessCard onBackToVaults={handleBackToVaults} onViewVault={handleViewVault} result={result} />
        ) : (
          <>
            <MotionView intensity="subtle">
              <StepPills currentStep={step} steps={stepLabels} />
            </MotionView>

            <View style={{ flexDirection: breakpoint.isCompact ? "column" : inlineDirection(), flexWrap: breakpoint.isCompact ? "nowrap" : "wrap", gap: breakpoint.isCompact ? spacing[4] : spacing[6], alignItems: "flex-start" }}>
              <MotionView key={`create-step-${step}`} intensity="structural" style={{ flex: 1, minWidth: breakpoint.isCompact ? undefined : 320, width: breakpoint.isCompact ? "100%" : undefined, gap: breakpoint.isCompact ? spacing[4] : spacing[6] }}>
                {showGoalStep ? (
                  <FormSection
                    icon="bullseye-arrow"
                    title={messages.pages.createVault.goalSectionTitle}
                    description={messages.pages.createVault.goalSectionDescription}
                  >
                    <TextField
                      errorMessage={errors.goalName}
                      helperText={messages.pages.createVault.fields.goalNameHelper}
                      label={messages.pages.createVault.fields.goalName}
                      onChangeText={(value) => setFieldValue("goalName", value)}
                      placeholder={messages.pages.createVault.fields.goalNamePlaceholder}
                      value={values.goalName}
                    />
                    <AmountField
                      errorMessage={errors.targetAmount}
                      helperText={messages.pages.createVault.fields.targetAmountHelper}
                      label={messages.pages.createVault.fields.targetAmount}
                      onChangeText={(value) => setFieldValue("targetAmount", value)}
                      value={values.targetAmount}
                    />
                    <TextField
                      errorMessage={errors.category}
                      helperText={messages.pages.createVault.fields.categoryHelper}
                      label={messages.pages.createVault.fields.category}
                      onChangeText={(value) => setFieldValue("category", value)}
                      placeholder={messages.pages.createVault.fields.categoryPlaceholder}
                      value={values.category}
                    />
                    <TextField
                      errorMessage={errors.note}
                      helperText={messages.pages.createVault.fields.noteHelper}
                      label={messages.pages.createVault.fields.note}
                      multiline
                      onChangeText={(value) => setFieldValue("note", value)}
                      placeholder={messages.pages.createVault.fields.notePlaceholder}
                      value={values.note}
                    />
                    <View style={{ gap: spacing[3] }}>
                      <AppText size="sm" tone="secondary" weight="medium">
                        {messages.common.labels.accentTheme}
                      </AppText>
                      <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
                        {accentThemeOptions.map((option) => {
                          const isSelected = values.accentTheme === option.value;

                          return (
                            <MotionPressable
                              key={option.value}
                              accessibilityRole="button"
                              intensity={isSelected ? "structural" : "subtle"}
                              onPress={() => setFieldValue("accentTheme", isSelected ? "" : option.value)}
                              style={{
                                borderRadius: radii.pill,
                                borderWidth: 1,
                                borderColor: option.tone,
                                backgroundColor: isSelected ? option.tone : colors.surface,
                                paddingHorizontal: spacing[4],
                                paddingVertical: spacing[3],
                              }}
                            >
                              <AppText style={{ color: isSelected ? colors.white : option.tone }} weight="semibold">
                                {option.label}
                              </AppText>
                            </MotionPressable>
                          );
                        })}
                      </View>
                    </View>
                  </FormSection>
                ) : null}

                {showRuleStep ? (
                  <FormSection
                    icon="shield-lock-outline"
                    tone="warning"
                    title={messages.pages.createVault.ruleSectionTitle}
                    description={messages.pages.createVault.ruleSectionDescription}
                    aside={
                      <View
                        style={{
                          borderRadius: radii.lg,
                          borderWidth: 1,
                          borderColor: colors.borderStrong,
                          backgroundColor: colors.warningSoft,
                          padding: spacing[5],
                          gap: spacing[3],
                        }}
                      >
                        <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
                          <MaterialCommunityIcons color={colors.warning} name="shield-alert-outline" size={20} />
                          <AppText weight="semibold">
                            {values.ruleType === "timeLock"
                              ? "Time lock"
                              : values.ruleType === "cooldownUnlock"
                                ? "Cooldown unlock"
                                : "Guardian approval"}
                          </AppText>
                        </View>
                        <AppText tone="secondary">
                          {values.ruleType === "timeLock"
                            ? messages.pages.createVault.timeLockDescription
                            : values.ruleType === "cooldownUnlock"
                              ? "The owner must request unlock first. Funds become withdrawable after the cooldown ends."
                              : "The owner requests unlock and the assigned guardian must approve before withdrawal is allowed."}
                        </AppText>
                      </View>
                    }
                  >
                    <View style={{ gap: spacing[3] }}>
                      <AppText size="sm" tone="secondary" weight="medium">
                        Protection rule
                      </AppText>
                      <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
                        {ruleOptions.map((option) => {
                          const isSelected = values.ruleType === option.value;

                          return (
                            <MotionPressable
                              key={option.value}
                              accessibilityRole="button"
                              containerStyle={{ flex: 1, minWidth: breakpoint.isCompact ? undefined : 190 }}
                              intensity={isSelected ? "structural" : "subtle"}
                              onPress={() => setFieldValue("ruleType", option.value)}
                              style={{
                                borderRadius: radii.lg,
                                borderWidth: 1,
                                borderColor: isSelected ? colors.accentStrong : colors.border,
                                backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                                padding: spacing[4],
                                gap: spacing[3],
                              }}
                            >
                              <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
                                <View
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: radii.sm,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isSelected ? colors.accentStrong : colors.surfaceMuted,
                                  }}
                                >
                                  <MaterialCommunityIcons
                                    color={isSelected ? colors.white : colors.accentStrong}
                                    name={option.icon}
                                    size={18}
                                  />
                                </View>
                                <AppText weight="semibold">{option.label}</AppText>
                              </View>
                              <AppText size="sm" tone="secondary">
                                {option.description}
                              </AppText>
                            </MotionPressable>
                          );
                        })}
                      </View>
                    </View>

                    {values.ruleType === "timeLock" ? (
                      <TextField
                        errorMessage={errors.unlockDate}
                        helperText={messages.pages.createVault.fields.unlockDateHelper}
                        label={messages.pages.createVault.fields.unlockDate}
                        onChangeText={(value) => setFieldValue("unlockDate", value)}
                        placeholder={messages.pages.createVault.fields.unlockDatePlaceholder}
                        value={values.unlockDate}
                      />
                    ) : null}

                    {values.ruleType === "cooldownUnlock" ? (
                      <TextField
                        errorMessage={errors.cooldownDays}
                        helperText="Choose how long the unlock request should wait before withdrawal becomes eligible."
                        label="Cooldown days"
                        onChangeText={(value) => setFieldValue("cooldownDays", value)}
                        placeholder="7"
                        value={values.cooldownDays}
                      />
                    ) : null}

                    {values.ruleType === "guardianApproval" ? (
                      <TextField
                        errorMessage={errors.guardianAddress}
                        helperText="Enter the wallet address that must approve unlock requests."
                        label="Guardian wallet"
                        onChangeText={(value) => setFieldValue("guardianAddress", value)}
                        placeholder="0x..."
                        value={values.guardianAddress}
                      />
                    ) : null}
                  </FormSection>
                ) : null}

                {showReviewStep && review ? (
                  <FormSection
                    icon="clipboard-check-outline"
                    tone="positive"
                    title={messages.pages.createVault.reviewSectionTitle}
                    description={messages.pages.createVault.reviewSectionDescription}
                  >
                    <CreateVaultReviewPanel review={review} />
                  </FormSection>
                ) : null}

                {breakpoint.isCompact ? null : renderStepActions()}
              </MotionView>

              <MotionView delay={120} intensity="subtle" style={{ flex: 1, minWidth: breakpoint.isCompact ? undefined : 280, width: breakpoint.isCompact ? "100%" : undefined, gap: spacing[4] }}>
                <CreateVaultPreviewCard targetAmount={Number.isFinite(targetAmount) ? targetAmount : 0} values={values} />
                {result && state.status !== "success" && state.didOnchainSucceed ? (
                  <SecondaryButton icon="shield-check-outline" label={messages.common.buttons.viewVault} onPress={handleViewVault} />
                ) : null}
              </MotionView>
            </View>
          </>
        )}
      </PageContainer>
    </Screen>
  );
}
