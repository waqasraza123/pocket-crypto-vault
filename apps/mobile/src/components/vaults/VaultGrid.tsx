import { View } from "react-native";

import type { VaultSummary } from "../../types";
import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { spacing } from "../../theme";
import { EmptyState } from "../primitives";
import { VaultCard } from "./VaultCard";

export interface VaultGridProps {
  vaults: VaultSummary[];
}

export const VaultGrid = ({ vaults }: VaultGridProps) => {
  const adaptiveLayout = useAdaptiveLayout();

  if (vaults.length === 0) {
    return (
      <EmptyState
        description="Create your first protected vault to begin building a goal with real structure."
        title="No vaults yet"
      />
    );
  }

  return (
    <View
      style={{
        flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column",
        flexWrap: "wrap",
        gap: spacing[4],
      }}
    >
      {vaults.map((vault) => (
        <View key={vault.address} style={{ flexBasis: adaptiveLayout.useSplitLayout ? "48%" : "100%", flexGrow: 1 }}>
          <VaultCard vault={vault} />
        </View>
      ))}
    </View>
  );
};
