import { Slot } from "expo-router";

import { MarketingShell } from "../../components/layout";

export default function MarketingLayout() {
  return (
    <MarketingShell>
      <Slot />
    </MarketingShell>
  );
}
