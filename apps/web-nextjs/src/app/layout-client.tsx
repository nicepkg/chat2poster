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
} from "@chat2poster/shared-ui";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "~/components/theme-provider";
import {
  siteConfig,
  githubConfig,
  socialLinksConfig,
  footerConfig,
  authorConfig,
} from "~/lib/site-info";

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Import", href: "/import" },
  { label: "Docs", href: "/docs/en" },
];

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

  // Check if we're on a docs page - don't show header/footer there (Nextra has its own)
  const isDocsPage = pathname.startsWith("/docs");
  // Check if we're on the editor page - no header/footer needed
  const isEditorPage = pathname === "/editor";
  // Check if we're on manual or paste page - minimal header/footer
  const isMinimalPage = pathname === "/manual" || pathname === "/paste";

  const showHeaderFooter = !isDocsPage && !isEditorPage && !isMinimalPage;

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <ThemeProvider>
      {showHeaderFooter && (
        <SiteHeader
          logo={<Logo width={28} height={28} name={siteConfig.name} />}
          navItems={navItems}
          githubUrl={githubConfig.url}
          showThemeToggle
          onNavigate={handleNavigate}
        />
      )}
      <div className={showHeaderFooter ? "min-h-[calc(100vh-64px)]" : ""}>
        {children}
      </div>
      {showHeaderFooter && (
        <SiteFooter
          logo={<Logo width={28} height={28} name={siteConfig.name} />}
          description={footerConfig.description.en}
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
    </ThemeProvider>
  );
}
