export interface VaultMetadataFallback {
  goalName?: string;
  category?: string;
  note?: string;
  accentTheme?: string;
  accentTone?: string;
  metadataStatus?: "pending" | "saved" | "failed";
}
