import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const AllowanceRequiredNotice = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="accent">
      <AppHeading size="md">{title ?? messages.deposit.approvalRequiredTitle}</AppHeading>
      <AppText tone="secondary">{description ?? messages.deposit.approvalRequiredDescription}</AppText>
    </SurfaceCard>
  );
};
