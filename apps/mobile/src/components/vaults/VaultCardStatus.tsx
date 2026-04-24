import type { VaultStatus } from "../../types";
import { useI18n } from "../../lib/i18n";
import { StatusChip } from "../primitives";

export interface VaultCardStatusProps {
  status: VaultStatus;
}

export const VaultCardStatus = ({ status }: VaultCardStatusProps) => {
  const { messages } = useI18n();

  const labelMap: Record<VaultStatus, { label: string; tone: "active" | "locked" | "unlocked" | "closed" }> = {
    active: { label: messages.vaults.status.active, tone: "active" },
    locked: { label: messages.vaults.status.locked, tone: "locked" },
    unlocking: { label: "Unlocking", tone: "locked" },
    unlocked: { label: messages.vaults.status.unlocked, tone: "unlocked" },
    withdrawn: { label: messages.vaults.status.withdrawn, tone: "closed" },
    closed: { label: messages.vaults.status.closed, tone: "closed" },
  };

  return <StatusChip label={labelMap[status].label} tone={labelMap[status].tone} />;
};
