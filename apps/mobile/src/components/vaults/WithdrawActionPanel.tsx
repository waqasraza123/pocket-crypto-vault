import { View } from "react-native";

import { formatUsdc } from "../../lib/format";
import type { VaultDetail } from "../../types";
import type { VaultWithdrawFlowController } from "../../hooks/useVaultWithdrawFlow";
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
}: {
  vault: VaultDetail;
  flow: VaultWithdrawFlowController;
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
    </SurfaceCard>
  );
};
