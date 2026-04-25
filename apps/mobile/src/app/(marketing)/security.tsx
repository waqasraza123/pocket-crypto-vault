import { Stack, useRouter } from "expo-router";

import { SecurityPageContent } from "../../components/marketing";
import { useScreenTracking } from "../../lib/analytics";
import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";

export default function SecurityScreen() {
  const router = useRouter();
  const { messages } = useI18n();

  useScreenTracking("security_viewed", {}, "security");

  return (
    <>
      <Stack.Screen options={{ title: messages.pages.security.title }} />
      <SecurityPageContent
        onCreateVault={() => router.push(routes.createVault)}
        onEnterVaults={() => router.push(routes.appHome)}
      />
    </>
  );
}
