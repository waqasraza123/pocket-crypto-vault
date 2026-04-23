import type { VaultStatus } from "../../types";
import { StatusChip } from "../primitives";

const labelMap: Record<VaultStatus, { label: string; tone: "active" | "locked" | "unlocked" | "closed" }> = {
  active: { label: "Your vault is active", tone: "active" },
  locked: { label: "Withdrawals locked", tone: "locked" },
  unlocked: { label: "Withdraw when eligible", tone: "unlocked" },
  withdrawn: { label: "Funds withdrawn", tone: "closed" },
  closed: { label: "Vault closed", tone: "closed" },
};

export interface VaultCardStatusProps {
  status: VaultStatus;
}

export const VaultCardStatus = ({ status }: VaultCardStatusProps) => {
  return <StatusChip label={labelMap[status].label} tone={labelMap[status].tone} />;
};
