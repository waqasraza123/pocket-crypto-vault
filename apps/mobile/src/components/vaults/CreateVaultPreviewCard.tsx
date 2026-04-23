import type { CreateVaultInput } from "../../types";
import { formatLongDate, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { getVaultAccentThemeLabel, getVaultAccentTone } from "../../lib/contracts/mappers";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface CreateVaultPreviewCardProps {
  values: CreateVaultInput;
  targetAmount: number;
}

export const CreateVaultPreviewCard = ({ values, targetAmount }: CreateVaultPreviewCardProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="accent" style={{ borderColor: getVaultAccentTone(values.accentTheme) }}>
      <AppText size="sm" tone="accent" weight="semibold">
        {messages.common.labels.livePreview}
      </AppText>
      <AppHeading size="lg">{values.goalName || messages.pages.createVault.preview.emptyGoal}</AppHeading>
      <AppText tone="secondary">{values.note || messages.pages.createVault.preview.emptyNote}</AppText>
      {values.category ? <AppText tone="secondary">{values.category}</AppText> : null}
      <AppText weight="semibold">{formatUsdc(targetAmount || 0)}</AppText>
      <AppText tone="secondary">
        {values.unlockDate
          ? interpolate(messages.vaults.protectionRuleUnlocksOn, { date: formatLongDate(values.unlockDate) })
          : messages.pages.createVault.preview.chooseUnlockDate}
      </AppText>
      {values.accentTheme ? <AppText tone="secondary">{getVaultAccentThemeLabel(values.accentTheme)}</AppText> : null}
    </SurfaceCard>
  );
};
