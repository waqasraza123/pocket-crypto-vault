import { StatusChip } from "../primitives";

export interface NetworkBadgeProps {
  label: string;
  tone?: "supported" | "unsupported" | "muted";
}

export const NetworkBadge = ({ label, tone = "supported" }: NetworkBadgeProps) => {
  return (
    <StatusChip
      label={label}
      tone={tone === "supported" ? "active" : tone === "unsupported" ? "danger" : "closed"}
    />
  );
};
