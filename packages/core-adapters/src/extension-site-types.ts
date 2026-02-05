import type { Provider } from "@chat2poster/core-schema";

export interface ExtensionSiteThemeTokens {
  primary: string;
  secondary: string;
  primaryForeground: string;
  secondaryForeground: string;
}

export interface ExtensionSiteTheme {
  light: ExtensionSiteThemeTokens;
  dark?: ExtensionSiteThemeTokens;
}

export interface ExtensionSiteConfig {
  id: string;
  provider: Provider;
  name: string;
  hostPermissions: string[];
  hostPatterns: RegExp[];
  conversationUrlPatterns: RegExp[];
  getConversationId: (url: string) => string | null;
  theme: ExtensionSiteTheme;
}
