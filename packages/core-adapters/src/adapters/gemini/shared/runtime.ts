import type { GeminiRuntimeParams } from "./types";

function extractWithPatterns(
  source: string,
  patterns: RegExp[],
): string | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(source);
    const value = match?.[1]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function extractRuntimeParamsFromHtml(
  html: string,
  hl: string,
): GeminiRuntimeParams | null {
  const at = extractWithPatterns(html, [
    /"SNlM0e":"([^"]+)"/,
    /\\"SNlM0e\\"\s*:\s*\\"([^"]+)\\"/,
  ]);
  const bl = extractWithPatterns(html, [
    /"cfb2h":"([^"]+)"/,
    /\\"cfb2h\\"\s*:\s*\\"([^"]+)\\"/,
  ]);
  const fSid = extractWithPatterns(html, [
    /"FdrFJe":"([^"]+)"/,
    /\\"FdrFJe\\"\s*:\s*\\"([^"]+)\\"/,
  ]);

  if (!bl || !fSid) {
    return null;
  }

  return { at, bl, fSid, hl };
}

export function extractHtmlLang(html: string): string | undefined {
  const lang = extractWithPatterns(html, [/<html[^>]*\slang="([^"]+)"/i]);
  return lang?.split("-")[0]?.trim() || undefined;
}

export function getPreferredLanguage(document?: Document): string {
  const browserLanguage =
    typeof globalThis.navigator !== "undefined"
      ? globalThis.navigator.language
      : "";

  const documentLang = document?.documentElement.lang?.trim();
  return documentLang || browserLanguage.split("-")[0] || "en";
}
