import Link from "next/link";
import { Banner } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout, LocaleSwitch, Navbar, ThemeSwitch } from "nextra-theme-docs";
import { Logo } from "~/components/shared/logo";
import { SiteFooter } from "~/components/shared/site-footer";
import { githubConfig, bannerConfig } from "~/lib/site-info";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function DocsLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const pageMap = await getPageMap(`/${locale}`);
  const lang = locale as "en" | "zh";

  return (
    <Layout
      pageMap={pageMap}
      docsRepositoryBase={githubConfig.docsBase}
      editLink="Edit this page on GitHub"
      sidebar={{
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
      }}
      toc={{
        backToTop: true,
      }}
      feedback={{
        content: "Question? Give us feedback →",
        labels: "feedback,documentation",
        link: githubConfig.issuesUrl,
      }}
      i18n={[
        { locale: "en", name: "English" },
        { locale: "zh", name: "中文" },
      ]}
      navbar={
        <Navbar
          logo={
            <Link href="/" className="flex items-center gap-2">
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
      footer={<SiteFooter lang={lang} />}
      banner={
        <Banner storageKey={bannerConfig.storageKey}>
          <span>
            {bannerConfig.text[lang]}{" "}
            <a
              href={githubConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="x:underline x:underline-offset-2"
            >
              {bannerConfig.linkText[lang]}
            </a>
          </span>
        </Banner>
      }
    >
      {children}
    </Layout>
  );
}
