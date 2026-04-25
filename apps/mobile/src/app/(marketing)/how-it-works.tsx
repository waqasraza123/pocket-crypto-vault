import { Stack, useRouter } from "expo-router";

import { HowItWorksPageContent } from "../../components/marketing";
import { useScreenTracking } from "../../lib/analytics";
import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";

export default function HowItWorksScreen() {
  const router = useRouter();
  const { messages } = useI18n();

  useScreenTracking("how_it_works_viewed", {}, "how-it-works");

  return (
    <>
      <Stack.Screen options={{ title: messages.pages.howItWorks.title }} />
      <HowItWorksPageContent
        onCreateVault={() => router.push(routes.createVault)}
        onEnterVaults={() => router.push(routes.appHome)}
      />
    </>
  );
}
