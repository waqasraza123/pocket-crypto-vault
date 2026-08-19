import { Slot, usePathname } from "expo-router";

import { MarketingShell } from "../../components/layout";
import { routes } from "../../lib/routing";

export default function MarketingLayout() {
  const pathname = usePathname();

  if (pathname === routes.signIn || pathname === routes.createAccount) {
    return <Slot />;
  }

  return (
    <MarketingShell>
      <Slot />
    </MarketingShell>
  );
}
