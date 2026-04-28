import type { AppConnectionState } from "@pocket-vault/shared";

import { routes } from "../routing";

export const marketingLanguageOptions = [
  {
    locale: "en",
    label: "English",
  },
  {
    locale: "ar",
    label: "العربية",
  },
] as const;

export const getMarketingCtaTargets = () => ({
  enterVaults: routes.appHome,
  createVault: routes.createVault,
  howItWorks: routes.howItWorks,
  security: routes.security,
});

export const getMarketingExperienceState = (connectionStatus: AppConnectionState["status"]) => ({
  showHero: true,
  showHowItWorks: true,
  showSecurity: true,
  showFinalCta: true,
  showConnectionNotice: connectionStatus !== "ready",
});
