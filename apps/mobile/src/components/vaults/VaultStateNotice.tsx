import type { VaultDegradedState } from "@pocket-vault/shared";

import { useI18n } from "../../lib/i18n";
import { AppErrorState } from "../feedback/AppErrorState";
import { SyncingNotice } from "../feedback/SyncingNotice";

export const VaultStateNotice = ({
  description,
  onRetry,
  state,
  title,
}: {
  state: VaultDegradedState;
  title: string;
  description: string;
  onRetry?: () => void;
}) => {
  const { messages } = useI18n();

  if (state === "syncing") {
    return <SyncingNotice label={description} />;
  }

  if (state === "healthy") {
    return null;
  }

  return (
    <AppErrorState
      description={description}
      primaryAction={onRetry ? { label: messages.common.buttons.tryAgain, onPress: onRetry, icon: "refresh" } : undefined}
      title={title}
    />
  );
};
