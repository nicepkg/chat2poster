import { CHATGPT_EXT_SITE } from "./adapters/chatgpt/ext-adapter";
import { CLAUDE_EXT_SITE } from "./adapters/claude/ext-adapter";
import { GEMINI_EXT_SITE } from "./adapters/gemini/ext-adapter";
import type {
  ExtensionSiteConfig,
  ExtensionSiteThemeTokens,
} from "./extension-site-types";

export { CHATGPT_EXT_SITE, CLAUDE_EXT_SITE, GEMINI_EXT_SITE };
export type { ExtensionSiteConfig, ExtensionSiteThemeTokens };

export const EXTENSION_SITE_CONFIGS: ExtensionSiteConfig[] = [
  CHATGPT_EXT_SITE,
  CLAUDE_EXT_SITE,
  GEMINI_EXT_SITE,
];

export const EXTENSION_HOST_PERMISSIONS = EXTENSION_SITE_CONFIGS.flatMap(
  (site) => site.hostPermissions,
);

export const EXTENSION_CONTENT_MATCHES = EXTENSION_HOST_PERMISSIONS;

export const EXTENSION_HOST_PATTERNS = EXTENSION_SITE_CONFIGS.flatMap(
  (site) => site.hostPatterns,
);

export function getExtensionSiteByUrl(url: string): ExtensionSiteConfig | null {
  return (
    EXTENSION_SITE_CONFIGS.find((site) =>
      site.conversationUrlPatterns.some((pattern) => pattern.test(url)),
    ) ?? null
  );
}

export function getExtensionSiteByHost(
  url: string,
): ExtensionSiteConfig | null {
  return (
    EXTENSION_SITE_CONFIGS.find((site) =>
      site.hostPatterns.some((pattern) => pattern.test(url)),
    ) ?? null
  );
}

export function resolveExtensionTheme(
  site: ExtensionSiteConfig | null,
  prefersDark: boolean,
): ExtensionSiteThemeTokens | null {
  if (!site) return null;
  if (prefersDark && site.theme.dark) {
    return site.theme.dark;
  }
  return site.theme.light;
}
