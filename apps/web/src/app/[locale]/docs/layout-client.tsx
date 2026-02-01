"use client";

import {
  GitHubIcon,
  BilibiliIcon,
  DouyinIcon,
  XIcon,
} from "@chat2poster/shared-ui/components/common";
import { SiteFooter } from "@chat2poster/shared-ui/components/layout";
import {
  createTranslator,
  localeOptions,
} from "@chat2poster/shared-ui/i18n/core";
import Link from "next/link";
import type { PageMapItem } from "nextra";
import { Banner } from "nextra/components";
import { Layout, LocaleSwitch, Navbar, ThemeSwitch } from "nextra-theme-docs";
import type { ComponentType } from "react";
import { Logo } from "~/components/shared/logo";
import {
  githubConfig,
  bannerConfig,
  footerConfig,
  socialLinksConfig,
  authorConfig,
} from "~/lib/site-info";

type SocialLinkKey = keyof typeof socialLinksConfig;
type SocialIcon = ComponentType<{ className?: string }>;
const socialIconMap: Record<SocialLinkKey, SocialIcon> = {
  github: GitHubIcon as SocialIcon,
  bilibili: BilibiliIcon as SocialIcon,
  douyin: DouyinIcon as SocialIcon,
  twitter: XIcon as SocialIcon,
};

const socialEntries = Object.entries(socialLinksConfig) as Array<
  [SocialLinkKey, (typeof socialLinksConfig)[SocialLinkKey]]
>;

const socialLinks = socialEntries
  .filter(([, config]) => config.href && config.href.length > 0)
  .map(([key, config]) => ({
    label: config.label,
    href: config.href,
    icon: (() => {
      const Icon = socialIconMap[key];
      return <Icon className="h-5 w-5 fill-current" />;
    })(),
  }));

type DocsLayoutClientProps = {
  children: React.ReactNode;
  locale: string;
  pageMap: PageMapItem[];
};

export default function DocsLayoutClient({
  children,
  locale,
  pageMap,
}: DocsLayoutClientProps) {
  const { t } = createTranslator(locale);

  return (
    <Layout
      pageMap={pageMap}
      docsRepositoryBase={githubConfig.docsBase}
      editLink={t("web.docs.editLink")}
      sidebar={{
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
      }}
      toc={{
        backToTop: true,
      }}
      feedback={{
        content: t("web.docs.feedback"),
        labels: "feedback,documentation",
        link: githubConfig.issuesUrl,
      }}
      i18n={localeOptions}
      navbar={
        <Navbar
          logo={
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Logo height={32} width={32} />
            </Link>
          }
          logoLink={false}
          projectLink={githubConfig.url}
        >
          <LocaleSwitch className="x:ml-2" />
          <ThemeSwitch className="x:ml-2" />
        </Navbar>
      }
      footer={
        <SiteFooter
          logo={<Logo width={28} height={28} />}
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
      }
      banner={
        <Banner storageKey={bannerConfig.storageKey}>
          <span>
            {t("web.banner.text")}{" "}
            <a
              href={githubConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="x:underline x:underline-offset-2"
            >
              {t("web.banner.linkText")}
            </a>
          </span>
        </Banner>
      }
    >
      {children}
    </Layout>
  );
}
