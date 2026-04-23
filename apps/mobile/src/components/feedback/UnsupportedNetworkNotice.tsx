import { interpolate, useI18n } from "../../lib/i18n";
import { SurfaceCard, AppHeading, AppText, SecondaryButton } from "../primitives";

export interface UnsupportedNetworkNoticeProps {
  onSwitch: () => void;
  label?: string | null;
}

export const UnsupportedNetworkNotice = ({ onSwitch, label }: UnsupportedNetworkNoticeProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{messages.feedback.unsupportedNetworkTitle}</AppHeading>
      <AppText tone="secondary">
        {label
          ? interpolate(messages.feedback.unsupportedNetworkDescriptionWithLabel, { label })
          : messages.feedback.unsupportedNetworkDescription}
      </AppText>
      <SecondaryButton icon="swap-horizontal" label={messages.common.buttons.switchNetwork} onPress={onSwitch} />
    </SurfaceCard>
  );
};
