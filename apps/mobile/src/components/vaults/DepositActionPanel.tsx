import { View } from "react-native";

import { formatUsdc } from "../../lib/format";
import { formatAtomicUsdcToNumber } from "../../lib/contracts/amount-utils";
import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import type { VaultDetail } from "../../types";
import type { VaultDepositFlowController } from "../../hooks/useVaultDepositFlow";
import { DepositErrorState, TransactionStatusCard } from "../feedback";
import { AppHeading, AppText, PrimaryButton, SurfaceCard } from "../primitives";
import { DepositAmountField } from "./DepositAmountField";
import { DepositApprovalNotice } from "./DepositApprovalNotice";
import { DepositPreviewCard } from "./DepositPreviewCard";
import { DepositSuccessCard } from "./DepositSuccessCard";

export const DepositActionPanel = ({
  vault,
  flow,
}: {
  vault: VaultDetail;
  flow: VaultDepositFlowController;
}) => {
  const { messages } = useI18n();
  const balanceLabel =
    flow.balance.balanceAtomic !== null && flow.balance.decimals !== null
      ? `${messages.common.labels.availableBalance} ${formatUsdc(
          formatAtomicUsdcToNumber({
            value: flow.balance.balanceAtomic,
            decimals: flow.balance.decimals,
          }),
        )}`
      : flow.balance.status === "loading"
        ? messages.deposit.loadingBalance
        : messages.deposit.balanceUnavailableShort;

  const showTransactionStatus =
    flow.state.status === "approving" ||
    flow.state.status === "approval_confirming" ||
    flow.state.status === "depositing" ||
    flow.state.status === "deposit_confirming";

  return (
    <SurfaceCard>
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="md">{messages.deposit.panelTitle}</AppHeading>
        <AppText tone="secondary">{messages.deposit.panelDescription}</AppText>
      </View>

      <DepositAmountField
        balanceLabel={balanceLabel}
        disabled={flow.isBusy}
        errorMessage={flow.state.status === "invalid" ? flow.state.errorMessage : null}
        helperText={flow.state.status === "idle" ? flow.validationMessage : null}
        onChangeText={flow.setAmountInput}
        onPressMax={flow.setMaxAmount}
        value={flow.amountInput}
      />

      <DepositApprovalNotice state={flow.state} />

      {flow.depositPreview ? <DepositPreviewCard preview={flow.depositPreview} /> : null}

      {showTransactionStatus ? (
        <TransactionStatusCard
          description={flow.statusCopy.description}
          details={[
            ...(flow.state.approvalTxHash ? [{ label: messages.common.labels.approvalHash, value: flow.state.approvalTxHash }] : []),
            ...(flow.state.depositTxHash ? [{ label: messages.common.labels.depositHash, value: flow.state.depositTxHash }] : []),
          ]}
          title={flow.statusCopy.title}
        />
      ) : null}

      {flow.state.status === "failed" ? <DepositErrorState onReset={flow.reset} onRetry={() => void flow.retry()} state={flow.state} /> : null}

      {flow.state.status === "success" ? <DepositSuccessCard onDismiss={flow.dismissSuccess} vault={vault} /> : null}

      {flow.state.status !== "success" && flow.state.status !== "failed" ? (
        <PrimaryButton
          disabled={flow.isBusy || (flow.state.status !== "ready_for_approval" && flow.state.status !== "ready_for_deposit")}
          icon={flow.state.status === "ready_for_approval" ? "shield-check-outline" : "plus-circle-outline"}
          label={flow.primaryActionLabel}
          onPress={() => void flow.submit()}
        />
      ) : null}
    </SurfaceCard>
  );
};
