import { routes } from "../../lib/routing";
import { useI18n } from "../../lib/i18n";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { DesktopHeader, type HeaderLink } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

export interface TopNavigationProps {
  area: "marketing" | "app";
}

export const TopNavigation = ({ area }: TopNavigationProps) => {
  const breakpoint = useBreakpoint();
  const { messages } = useI18n();
  const links =
    area === "marketing"
      ? [
          { label: messages.navigation.marketingLinks.howItWorks, href: routes.howItWorks },
          { label: messages.navigation.marketingLinks.security, href: routes.security },
        ]
      : [
          { label: messages.navigation.appLinks.home, href: routes.appHome },
          { label: messages.navigation.appLinks.create, href: routes.createVault },
          { label: messages.navigation.appLinks.activity, href: routes.activity },
        ];
  const ctaHref = area === "marketing" ? routes.appHome : routes.createVault;
  const ctaLabel = area === "marketing" ? messages.navigation.marketingCta : messages.navigation.appCta;

  if (breakpoint.isCompact) {
    return <MobileHeader ctaHref={ctaHref} ctaLabel={ctaLabel} links={links} />;
  }

  return <DesktopHeader ctaHref={ctaHref} ctaLabel={ctaLabel} links={links} />;
};
