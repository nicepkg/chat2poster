import { locales } from "@chat2poster/shared-ui/i18n/core";
import type { ReactNode } from "react";

// Note: dynamicParams = false is NOT supported by OpenNext Cloudflare
// See: https://github.com/opennextjs/opennextjs-cloudflare/issues/611
// The middleware handles invalid locales by redirecting to the default locale

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return children;
}
