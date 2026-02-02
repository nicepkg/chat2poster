import type { FetchOptions } from "../../network";
import { fetchExternal } from "../../network";

export interface FetchHtmlResult {
  html: string;
  cookies?: string;
}

/**
 * Private-window style headers (close to the Python implementation you pasted)
 *
 * Notes:
 * - These headers aim to mimic a real browser navigation request.
 * - If you still get 403 on Cloudflare Workers, it's likely IP/ASN based blocking.
 */
const DEFAULT_HTML_HEADERS: Record<string, string> = {
  // Python version UA
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/118.0.0.0 Safari/537.36",

  // Client hints (Python version)
  "Sec-CH-UA": '"Chromium";v="118", "Not=A?Brand";v="24"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',

  // Accept / language (Python version)
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9," +
    "image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",

  // Common navigation headers (helps look like a real page load)
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",

  // Avoid some proxy-ish cache behaviors
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

function buildHtmlHeaders(
  url: string,
  extra?: Record<string, string>,
): NonNullable<FetchOptions["headers"]> {
  // The Python code hardcodes Referer to https://chatgpt.com/
  // Keep that behavior (it matters for some WAF rules).
  const base: Record<string, string> = {
    ...DEFAULT_HTML_HEADERS,
    Referer: "https://chatgpt.com/",
  };

  // Some servers behave differently depending on Host/Origin.
  // We generally avoid setting Host manually (let fetch do it).
  // Origin is usually absent for top-level navigation, so we do NOT set it.

  // Allow caller overrides (if you want A/B testing)
  const custom = { ...base, ...(extra ?? {}) };

  return {
    // If your fetchExternal supports presets, set it.
    // If not, leaving preset here usually harmless.
    preset: "html",
    custom,
  };
}

/**
 * Fetch an HTML page and return both HTML and cookies
 *
 * @example
 * ```ts
 * const { html, cookies } = await fetchHtmlWithCookies('https://example.com/page');
 * ```
 */
export async function fetchHtmlWithCookies(
  url: string,
  options: Omit<FetchOptions, "headers"> & {
    /**
     * Optional header overrides for experimentation/debug.
     * Example: { "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" }
     */
    headerOverrides?: Record<string, string>;
  } = {},
): Promise<FetchHtmlResult> {
  const { headerOverrides, ...rest } = options;

  const result = await fetchExternal(url, {
    ...rest,
    headers: buildHtmlHeaders(url, headerOverrides),
  });

  if (!result.ok) {
    // Make the error actionable for your adapter layer
    const hint =
      result.status === 403
        ? " (403 on serverless often means WAF/anti-bot blocked your datacenter IP; consider browser-assisted mode or VPS fetch.)"
        : "";
    throw new Error(`HTTP ${result.status}: ${result.statusText}${hint}`);
  }

  return {
    html: await result.text(),
    // fetchExternal in your project already exposes cookies (as seen in your current code)
    cookies: result.cookies,
  };
}
