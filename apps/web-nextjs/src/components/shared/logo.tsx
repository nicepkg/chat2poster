"use client";

// Re-export Logo from shared-ui, wrapped with site config
import {
  Logo as SharedLogo,
  type LogoProps,
} from "@chat2poster/shared-ui/components/common";
import { siteConfig } from "~/lib/site-info";

export function Logo(props: Omit<LogoProps, "name">) {
  return <SharedLogo {...props} name={siteConfig.name} />;
}
