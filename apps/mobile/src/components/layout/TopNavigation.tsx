import { routes } from "../../lib/routing";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { DesktopHeader, type HeaderLink } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

export interface TopNavigationProps {
  area: "marketing" | "app";
}

const marketingLinks: HeaderLink[] = [
  { label: "How it works", href: routes.howItWorks },
  { label: "Security", href: routes.security },
];

const appLinks: HeaderLink[] = [
  { label: "My Vaults", href: routes.appHome },
  { label: "Create", href: routes.createVault },
  { label: "Activity", href: routes.activity },
];

export const TopNavigation = ({ area }: TopNavigationProps) => {
  const breakpoint = useBreakpoint();
  const links = area === "marketing" ? marketingLinks : appLinks;
  const ctaHref = area === "marketing" ? routes.appHome : routes.createVault;
  const ctaLabel = area === "marketing" ? "Open app" : "New vault";

  if (breakpoint.isCompact) {
    return <MobileHeader ctaHref={ctaHref} ctaLabel={ctaLabel} links={links} />;
  }

  return <DesktopHeader ctaHref={ctaHref} ctaLabel={ctaLabel} links={links} />;
};
