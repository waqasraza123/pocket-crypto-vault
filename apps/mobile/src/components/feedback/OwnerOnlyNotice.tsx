import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const OwnerOnlyNotice = ({ description }: { description?: string | null }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{messages.withdraw.ownerOnlyTitle}</AppHeading>
      <AppText tone="secondary">{description ?? messages.withdraw.ownerOnlyDescription}</AppText>
    </SurfaceCard>
  );
};
