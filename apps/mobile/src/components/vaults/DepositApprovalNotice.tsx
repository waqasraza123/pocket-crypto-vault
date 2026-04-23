import { useI18n } from "../../lib/i18n";
import type { DepositFlowState } from "../../types";
import { AllowanceRequiredNotice } from "../feedback";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const DepositApprovalNotice = ({ state }: { state: DepositFlowState }) => {
  const { messages } = useI18n();

  if (state.status === "ready_for_approval") {
    return (
      <AllowanceRequiredNotice
        description={messages.deposit.approvalRequiredDescription}
        title={messages.deposit.approvalRequiredTitle}
      />
    );
  }

  if (state.status === "approving" || state.status === "approval_confirming") {
    return (
      <SurfaceCard tone="accent">
        <AppHeading size="md">{messages.deposit.approvalInProgressTitle}</AppHeading>
        <AppText tone="secondary">{messages.deposit.approvalInProgressDescription}</AppText>
      </SurfaceCard>
    );
  }

  if (state.approvalCompleted) {
    return (
      <SurfaceCard tone="accent">
        <AppHeading size="md">{messages.deposit.approvalConfirmedTitle}</AppHeading>
        <AppText tone="secondary">{messages.deposit.approvalConfirmedDescription}</AppText>
      </SurfaceCard>
    );
  }

  return null;
};
