import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export const MetadataRecoveryNotice = ({
  title,
  description,
  onRetry,
  onViewVault,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
  onViewVault?: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{title ?? messages.feedback.metadataLiveTitle}</AppHeading>
      <AppText tone="secondary">{description}</AppText>
      {onRetry ? <PrimaryButton icon="refresh" label={messages.common.buttons.retryDetailsSave} onPress={onRetry} /> : null}
      {onViewVault ? <SecondaryButton icon="shield-check-outline" label={messages.common.buttons.viewVault} onPress={onViewVault} /> : null}
    </SurfaceCard>
  );
};
