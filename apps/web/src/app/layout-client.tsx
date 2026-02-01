"use client";

import {
  Logo,
  SiteHeader,
  SiteFooter,
  GitHubIcon,
  BilibiliIcon,
  DouyinIcon,
  XIcon,
  type NavItem,
  I18nProvider,
  useI18n,
} from "@chat2poster/shared-ui";
import {
  getLocaleFromPath,
  normalizeLocale,
  stripLocaleFromPath,
  type Locale,
} from "@chat2poster/shared-ui/i18n/core";
import { Agentation } from "agentation";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ThemeProvider } from "~/components/theme-provider";
import {
  siteConfig,
  githubConfig,
  socialLinksConfig,
  footerConfig,
  authorConfig,
} from "~/lib/site-info";

const socialIconMap = {
  github: GitHubIcon,
  bilibili: BilibiliIcon,
  douyin: DouyinIcon,
  twitter: XIcon,
} as const;

const socialLinks = Object.entries(socialLinksConfig)
  .filter(([, config]) => config.href && config.href.length > 0)
  .map(([key, config]) => ({
    label: config.label,
    href: config.href,
    icon: (() => {
      const Icon = socialIconMap[key as keyof typeof socialIconMap];
      return <Icon className="h-5 w-5 fill-current" />;
    })(),
  }));

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useMemo(
    () => normalizeLocale(getLocaleFromPath(pathname) ?? undefined),
    [pathname],
  );

  // Check if we're on a docs page - don't show header/footer there (Nextra has its own)
  const stripLocalePath = stripLocaleFromPath(pathname);
  const isDocsPage = stripLocalePath.startsWith("/docs");
  // Check if we're on the editor page - no header/footer needed
  const isEditorPage = stripLocalePath === "/editor";
  // Check if we're on manual or paste page - minimal header/footer
  const isMinimalPage =
    stripLocalePath === "/manual" || stripLocalePath === "/paste";

  const showHeaderFooter = !isDocsPage && !isEditorPage && !isMinimalPage;

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <I18nProvider locale={locale}>
      <ThemeProvider>
        <LayoutFrame
          onNavigate={handleNavigate}
          showHeaderFooter={showHeaderFooter}
        >
          {children}
        </LayoutFrame>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </I18nProvider>
  );
}

function LayoutFrame({
  children,
  onNavigate,
  showHeaderFooter,
}: {
  children: React.ReactNode;
  onNavigate: (href: string) => void;
  showHeaderFooter: boolean;
}) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const localePrefix = `/${locale}`;
  const navItems = useMemo<NavItem[]>(
    () => [
      { label: t("web.nav.home"), href: localePrefix },
      { label: t("web.nav.import"), href: `${localePrefix}/import` },
      { label: t("web.nav.docs"), href: `${localePrefix}/docs` },
    ],
    [localePrefix, t],
  );

  const handleLocaleChange = (newLocale: Locale) => {
    const pathWithoutLocale = stripLocaleFromPath(pathname);
    onNavigate(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <>
      {showHeaderFooter && (
        <SiteHeader
          logo={<Logo width={28} height={28} name={siteConfig.name} />}
          navItems={navItems}
          githubUrl={githubConfig.url}
          showThemeToggle
          showLocaleToggle
          onNavigate={onNavigate}
          onLocaleChange={handleLocaleChange}
        />
      )}
      <div className={showHeaderFooter ? "min-h-[calc(100vh-64px)]" : ""}>
        {children}
      </div>
      {showHeaderFooter && (
        <SiteFooter
          logo={<Logo width={28} height={28} name={siteConfig.name} />}
          description={t("web.footer.description")}
          navLinks={footerConfig.links.map((link) => ({
            label: link.label,
            href: link.href,
            external: true,
          }))}
          socialLinks={socialLinks}
          copyright={{
            holder: footerConfig.copyright.holder,
            license: footerConfig.copyright.license,
          }}
          author={{
            name: authorConfig.name,
            href: authorConfig.github,
          }}
        />
      )}
    </>
  );
}
