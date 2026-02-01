import { getPageMap } from "nextra/page-map";
import DocsLayoutClient from "./layout-client";
import "nextra-theme-docs/style.css";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function DocsLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const pageMap = await getPageMap(`/${locale}`);

  return (
    <DocsLayoutClient locale={locale} pageMap={pageMap}>
      {children}
    </DocsLayoutClient>
  );
}
