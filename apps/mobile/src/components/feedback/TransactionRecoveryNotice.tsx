import type { TransactionRecoveryRecord } from "@pocket-vault/shared";

import { useI18n } from "../../lib/i18n";
import { RecoveryNotice } from "./RecoveryNotice";

export const TransactionRecoveryNotice = ({
  item,
  onDismiss,
}: {
  item: TransactionRecoveryRecord;
  onDismiss?: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <RecoveryNotice
      description={item.description}
      primaryAction={
        onDismiss
          ? {
              label: messages.common.buttons.dismiss,
              onPress: onDismiss,
              icon: "check",
            }
          : undefined
      }
      title={item.title}
    />
  );
};
