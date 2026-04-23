import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const WithdrawalLockedNotice = ({ description }: { description?: string | null }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{messages.withdraw.flow.lockedTitle}</AppHeading>
      <AppText tone="secondary">{description ?? messages.withdraw.lockedDescription}</AppText>
    </SurfaceCard>
  );
};
