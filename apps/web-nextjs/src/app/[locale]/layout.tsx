import { locales } from "@chat2poster/shared-ui/i18n/core";
import type { ReactNode } from "react";

export const dynamicParams = false;

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return children;
}
