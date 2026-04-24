import { useEffect, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { useCreateVaultForm } from "../../../features/create-vault/useCreateVaultForm";
import { useAppReadiness } from "../../../hooks/useAppReadiness";
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
import { ScreenHeader } from "../../../components/layout";
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

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }} keyboardShouldPersistTaps="always">
      <Stack.Screen options={{ title: messages.pages.createVault.title }} />
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.createVault.eyebrow}
          title={messages.pages.createVault.title}
          description={messages.pages.createVault.description}
          action={<SecondaryButton icon="arrow-left" label={messages.common.buttons.backToVaults} onPress={handleBackToVaults} />}
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

            <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[6], alignItems: "flex-start" }}>
              <MotionView key={`create-step-${step}`} intensity="structural" style={{ flex: 1, minWidth: 320, gap: spacing[6] }}>
                {showGoalStep ? (
                  <FormSection
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
                            <Pressable
                              key={option.value}
                              accessibilityRole="button"
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
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </FormSection>
                ) : null}

                {showRuleStep ? (
                  <FormSection
                    title={messages.pages.createVault.ruleSectionTitle}
                    description={messages.pages.createVault.ruleSectionDescription}
                    aside={
                      <View
                        style={{
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.surfaceMuted,
                          padding: spacing[5],
                          gap: spacing[2],
                        }}
                      >
                        <AppText weight="semibold">
                          {values.ruleType === "timeLock"
                            ? "Time lock"
                            : values.ruleType === "cooldownUnlock"
                              ? "Cooldown unlock"
                              : "Guardian approval"}
                        </AppText>
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
                        {[
                          ["timeLock", "Time Lock"],
                          ["cooldownUnlock", "Cooldown Unlock"],
                          ["guardianApproval", "Guardian Approval"],
                        ].map(([ruleType, label]) => {
                          const isSelected = values.ruleType === ruleType;

                          return (
                            <Pressable
                              key={ruleType}
                              accessibilityRole="button"
                              onPress={() => setFieldValue("ruleType", ruleType as typeof values.ruleType)}
                              style={{
                                borderRadius: radii.pill,
                                borderWidth: 1,
                                borderColor: isSelected ? colors.accentStrong : colors.border,
                                backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                                paddingHorizontal: spacing[4],
                                paddingVertical: spacing[3],
                              }}
                            >
                              <AppText weight="semibold">{label}</AppText>
                            </Pressable>
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
                    title={messages.pages.createVault.reviewSectionTitle}
                    description={messages.pages.createVault.reviewSectionDescription}
                  >
                    <CreateVaultReviewPanel review={review} />
                  </FormSection>
                ) : null}

                <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
                  {step > 0 ? (
                    <SecondaryButton disabled={isBusy} icon="arrow-left" label={messages.common.buttons.back} onPress={previousStep} />
                  ) : null}
                  {step < 2 ? (
                    <PrimaryButton disabled={isBusy} icon="arrow-right" label={messages.common.buttons.continue} onPress={nextStep} />
                  ) : connectionState.status === "disconnected" || connectionState.status === "walletUnavailable" ? (
                    <PrimaryButton
                      disabled={isBusy}
                      icon="wallet-outline"
                      label={messages.common.buttons.connectWallet}
                      onPress={() => void connect()}
                    />
                  ) : connectionState.status === "unsupportedNetwork" ? (
                    <PrimaryButton
                      disabled={isBusy}
                      icon="swap-horizontal"
                      label={interpolate(messages.wallet.switchToChain, { chain: messages.common.networkBase })}
                      onPress={() => void switchNetwork()}
                    />
                  ) : (
                    <PrimaryButton
                      disabled={!canSubmit || readiness.status === "blocked"}
                      icon="shield-check-outline"
                      label={messages.common.buttons.createVault}
                      onPress={() => void handleCreate()}
                    />
                  )}
                </View>
              </MotionView>

              <MotionView delay={120} intensity="subtle" style={{ flex: 1, minWidth: 280, gap: spacing[4] }}>
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
