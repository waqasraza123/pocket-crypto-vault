import { View } from "react-native";

import { useCreateVaultForm } from "../../../features/create-vault/useCreateVaultForm";
import { useWalletConnection } from "../../../hooks/useWalletConnection";
import { colors, spacing } from "../../../theme";
import { FormSection, StepPills } from "../../../components/forms";
import { ScreenHeader } from "../../../components/layout";
import { StateBanner } from "../../../components/feedback";
import {
  AmountField,
  AppText,
  PageContainer,
  PrimaryButton,
  Screen,
  SecondaryButton,
  TextField,
} from "../../../components/primitives";
import { CreateVaultPreviewCard } from "../../../components/vaults";

const stepLabels = ["Goal", "Rule", "Review"];

export default function CreateVaultScreen() {
  const { values, errors, step, preview, setFieldValue, nextStep, previousStep, validateAll } = useCreateVaultForm();
  const { connectionState } = useWalletConnection();
  const targetAmount = Number.parseFloat(values.targetAmount || "0");

  const showGoalStep = step === 0;
  const showRuleStep = step === 1;
  const showReviewStep = step === 2;

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }} keyboardShouldPersistTaps="always">
      <PageContainer width="dashboard" style={{ gap: spacing[8], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="Create Vault"
          title="Protect one goal with a simple time rule."
          description="This phase keeps creation static while the wallet, chain, and contract-read boundaries settle underneath the same universal route."
        />

        <StateBanner
          icon="hammer-wrench"
          label={
            connectionState.status === "ready"
              ? "Wallet and network are ready. Vault creation transactions arrive in the next phase."
              : "This flow is already structured for later transactions, but write wiring is intentionally deferred."
          }
        />

        <StepPills currentStep={step} steps={stepLabels} />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[6], alignItems: "flex-start" }}>
          <View style={{ flex: 1, minWidth: 320, gap: spacing[6] }}>
            {showGoalStep ? (
              <FormSection
                title="What are you saving for?"
                description="Keep the goal specific enough that progress feels emotionally meaningful."
              >
                <TextField
                  errorMessage={errors.goalName}
                  helperText="Examples: Emergency reserve, Umrah fund, Studio upgrade"
                  label="Goal name"
                  onChangeText={(value) => setFieldValue("goalName", value)}
                  placeholder="Emergency Reserve"
                  value={values.goalName}
                />
                <TextField
                  errorMessage={errors.note}
                  helperText="Optional context that keeps the goal vivid."
                  label="Short note"
                  multiline
                  onChangeText={(value) => setFieldValue("note", value)}
                  placeholder="Six months of living costs, protected until late summer."
                  value={values.note}
                />
                <AmountField
                  errorMessage={errors.targetAmount}
                  onChangeText={(value) => setFieldValue("targetAmount", value)}
                  value={values.targetAmount}
                />
              </FormSection>
            ) : null}

            {showRuleStep ? (
              <FormSection
                title="Protect this goal"
                description="Phase 1 only supports a time lock, which keeps the rule model clear and simple."
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
                    <AppText weight="semibold">Time lock</AppText>
                    <AppText tone="secondary">
                      Deposits stay easy. Withdrawals stay unavailable until the chosen date.
                    </AppText>
                  </View>
                }
              >
                <TextField
                  errorMessage={errors.unlockDate}
                  helperText="Choose the date after which the vault can allow withdrawals."
                  label="Unlock date"
                  onChangeText={(value) => setFieldValue("unlockDate", value)}
                  placeholder="2026-08-30"
                  value={values.unlockDate}
                />
              </FormSection>
            ) : null}

            {showReviewStep ? (
              <FormSection
                title="Review the vault"
                description="The final create action arrives in a later phase. This step already locks the structure and copy."
              >
                <View
                  style={{
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    padding: spacing[5],
                    gap: spacing[3],
                  }}
                >
                  <AppText tone="secondary">Goal</AppText>
                  <AppText weight="semibold">{preview.goalName}</AppText>
                  <AppText tone="secondary">Target amount</AppText>
                  <AppText weight="semibold">{values.targetAmount || "0"} USDC</AppText>
                  <AppText tone="secondary">Unlock date</AppText>
                  <AppText weight="semibold">{values.unlockDate}</AppText>
                </View>
              </FormSection>
            ) : null}

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
              {step > 0 ? <SecondaryButton icon="arrow-left" label="Back" onPress={previousStep} /> : null}
              {step < 2 ? (
                <PrimaryButton icon="arrow-right" label="Continue" onPress={nextStep} />
              ) : (
                <PrimaryButton
                  icon="check-circle-outline"
                  label="Validation ready"
                  onPress={() => {
                    validateAll();
                  }}
                />
              )}
            </View>
          </View>

          <View style={{ flex: 1, minWidth: 280 }}>
            <CreateVaultPreviewCard targetAmount={Number.isFinite(targetAmount) ? targetAmount : 0} values={values} />
          </View>
        </View>
      </PageContainer>
    </Screen>
  );
}
