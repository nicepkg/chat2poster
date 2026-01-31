import { getPageMap } from "nextra/page-map";
import DocsLayoutClient from "./layout-client";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function DocsLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const pageMap = await getPageMap(`/${locale}/docs`);

  return (
    <DocsLayoutClient locale={locale} pageMap={pageMap}>
      {children}
    </DocsLayoutClient>
  );
}
