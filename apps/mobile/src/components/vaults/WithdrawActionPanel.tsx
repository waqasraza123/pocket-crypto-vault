import { View } from "react-native";

import { formatUsdc } from "../../lib/format";
import type { VaultDetail } from "../../types";
import type { VaultWithdrawFlowController } from "../../hooks/useVaultWithdrawFlow";
import type { useVaultUnlockFlow } from "../../hooks/useVaultUnlockFlow";
import {
  OwnerOnlyNotice,
  TransactionStatusCard,
  WithdrawErrorState,
  WithdrawalLockedNotice,
} from "../feedback";
import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import { AppHeading, AppText, PrimaryButton, SurfaceCard } from "../primitives";
import { UnlockCountdownCard } from "./UnlockCountdownCard";
import { WithdrawAmountField } from "./WithdrawAmountField";
import { WithdrawConfirmationCard } from "./WithdrawConfirmationCard";
import { WithdrawEligibilityCard } from "./WithdrawEligibilityCard";
import { WithdrawPreviewCard } from "./WithdrawPreviewCard";
import { WithdrawSuccessCard } from "./WithdrawSuccessCard";

export const WithdrawActionPanel = ({
  vault,
  flow,
  unlockFlow,
}: {
  vault: VaultDetail;
  flow: VaultWithdrawFlowController;
  unlockFlow: ReturnType<typeof useVaultUnlockFlow>;
}) => {
  const { messages } = useI18n();
  const eligibility = flow.eligibility;

  if (!eligibility) {
    return null;
  }

  return (
    <SurfaceCard>
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="md">{messages.withdraw.panelTitle}</AppHeading>
        <AppText tone="secondary">{messages.withdraw.panelDescription}</AppText>
      </View>

      <WithdrawEligibilityCard eligibility={eligibility} />

      {eligibility.availability === "owner_only" ? <OwnerOnlyNotice description={eligibility.message} /> : null}
      {eligibility.availability === "locked" ? <UnlockCountdownCard eligibility={eligibility} /> : null}
      {eligibility.availability === "locked" ? <WithdrawalLockedNotice description={eligibility.message} /> : null}

      {(eligibility.availability === "unlock_request_required" ||
        eligibility.availability === "cooldown_pending" ||
        eligibility.availability === "guardian_pending" ||
        eligibility.availability === "guardian_rejected" ||
        eligibility.availability === "guardian_only") && unlockFlow.message ? (
        <TransactionStatusCard
          description={unlockFlow.message}
          details={unlockFlow.txHash ? [{ label: messages.common.labels.transactionHash, value: unlockFlow.txHash }] : []}
          title={
            unlockFlow.status === "failed"
              ? messages.feedback.dataUnavailableTitle
              : unlockFlow.status === "success"
                ? "Rule state updated"
                : "Updating vault rule"
          }
        />
      ) : null}

      {eligibility.canWithdraw ? (
        <WithdrawAmountField
          balanceLabel={formatUsdc(eligibility.availableAmount)}
          disabled={flow.isBusy}
          errorMessage={flow.state.status === "invalid" ? flow.state.errorMessage : null}
          helperText={flow.state.status === "idle" ? flow.validationMessage : null}
          onChangeText={flow.setAmountInput}
          onPressMax={flow.setMaxAmount}
          value={flow.amountInput}
        />
      ) : null}

      {flow.withdrawPreview ? <WithdrawPreviewCard preview={flow.withdrawPreview} /> : null}

      {flow.state.status === "confirming_intent" && flow.withdrawPreview ? (
        <WithdrawConfirmationCard
          disabled={flow.isBusy}
          eligibility={eligibility}
          onCancel={flow.cancelConfirmation}
          onConfirm={flow.confirmWithdrawal}
          preview={flow.withdrawPreview}
          vault={vault}
        />
      ) : null}

      {flow.state.status === "awaiting_wallet_confirmation" ||
      flow.state.status === "submitting" ||
      flow.state.status === "confirming" ? (
        <TransactionStatusCard
          description={flow.statusCopy.description}
          details={flow.state.withdrawTxHash ? [{ label: messages.common.labels.withdrawHash, value: flow.state.withdrawTxHash }] : []}
          title={flow.statusCopy.title}
        />
      ) : null}

      {flow.state.status === "failed" ? <WithdrawErrorState onReset={flow.reset} onRetry={() => void flow.retry()} state={flow.state} /> : null}

      {flow.state.status === "success" ? <WithdrawSuccessCard onDismiss={flow.dismissSuccess} vault={vault} /> : null}

      {eligibility.canWithdraw &&
      flow.state.status !== "confirming_intent" &&
      flow.state.status !== "success" &&
      flow.state.status !== "failed" ? (
        <PrimaryButton
          disabled={flow.isBusy}
          icon="arrow-up-right"
          label={flow.primaryActionLabel}
          onPress={flow.requestConfirmation}
        />
      ) : null}

      {eligibility.canRequestUnlock ? (
        <PrimaryButton
          disabled={unlockFlow.isBusy}
          icon="shield-lock-open-outline"
          label="Request unlock"
          onPress={() => void unlockFlow.requestUnlock()}
        />
      ) : null}

      {eligibility.canCancelUnlockRequest ? (
        <PrimaryButton
          disabled={unlockFlow.isBusy}
          icon="close-circle-outline"
          label="Cancel unlock request"
          onPress={() => void unlockFlow.cancelUnlockRequest()}
        />
      ) : null}

      {eligibility.canGuardianApprove ? (
        <PrimaryButton
          disabled={unlockFlow.isBusy}
          icon="check-circle-outline"
          label="Approve unlock"
          onPress={() => void unlockFlow.approveUnlock()}
        />
      ) : null}

      {eligibility.canGuardianReject ? (
        <PrimaryButton
          disabled={unlockFlow.isBusy}
          icon="close-circle-outline"
          label="Reject unlock"
          onPress={() => void unlockFlow.rejectUnlock()}
        />
      ) : null}
    </SurfaceCard>
  );
};
