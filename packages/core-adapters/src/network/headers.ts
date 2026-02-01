/**
 * HTTP Headers Generator
 *
 * Provides realistic HTTP headers for external requests.
 * Uses real browser fingerprint data to bypass Cloudflare and rate limiting.
 *
 * @see https://github.com/deedy5/duckduckgo_search/blob/main/duckduckgo_search/headers.json.gz
 */

import realUserHeadersJson from "./real-user-headers.json";

/**
 * Browser header with probability weight
 */
interface BrowserHeader {
  header: Record<string, string>;
  probability: number;
}

/**
 * Standard header presets for different request types
 */
export type HeaderPreset = "html" | "json" | "api";

/**
 * Options for generating request headers
 */
export interface HeaderOptions {
  /**
   * Header preset to use
   * - html: For fetching HTML pages (uses real browser fingerprints)
   * - json: For JSON API requests
   * - api: For API requests with minimal headers
   * @default 'html'
   */
  preset?: HeaderPreset;

  /**
   * Use real user headers with probability-based selection
   * Only applies to 'html' preset
   * @default true
   */
  useRealUserHeaders?: boolean;

  /**
   * Custom headers to merge (overrides defaults)
   */
  custom?: Record<string, string>;

  /**
   * Referer URL to include
   */
  referer?: string;

  /**
   * Origin URL to include
   */
  origin?: string;
}

/**
 * Get a random real user header based on probability weights
 *
 * This provides realistic browser fingerprints that can bypass
 * Cloudflare and other anti-bot protections.
 */
export function getRealUserHeaders(): Record<string, string> {
  const realUserHeaders = realUserHeadersJson as unknown as BrowserHeader[];

  // Calculate total weight
  const totalWeight = realUserHeaders.reduce(
    (sum, item) => sum + item.probability,
    0,
  );

  // Weighted random selection
  let random = Math.random() * totalWeight;

  for (const item of realUserHeaders) {
    random -= item.probability;
    if (random <= 0) {
      return { ...item.header };
    }
  }

  // Fallback to first item (should not happen)
  return { ...realUserHeaders[0]!.header };
}

/**
 * Generate Accept header based on preset
 */
function getAcceptHeader(preset: HeaderPreset): string {
  switch (preset) {
    case "html":
      return "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
    case "json":
      return "application/json, text/plain, */*";
    case "api":
      return "application/json";
  }
}

/**
 * Generate realistic HTTP headers for external requests
 *
 * For HTML requests, uses real browser fingerprints (including sec-ch-ua,
 * Sec-Fetch-*, etc.) to bypass Cloudflare and anti-bot protections.
 *
 * @example
 * ```ts
 * // HTML page request with real browser fingerprint
 * const headers = getRequestHeaders({ preset: 'html' });
 *
 * // JSON API request
 * const headers = getRequestHeaders({ preset: 'json' });
 *
 * // With custom headers
 * const headers = getRequestHeaders({
 *   preset: 'api',
 *   custom: { 'Authorization': 'Bearer token' }
 * });
 * ```
 */
export function getRequestHeaders(options: HeaderOptions = {}): HeadersInit {
  const {
    preset = "html",
    useRealUserHeaders = true,
    custom = {},
    referer,
    origin,
  } = options;

  let baseHeaders: Record<string, string>;

  // For HTML preset, use real user headers for better anti-detection
  if (preset === "html" && useRealUserHeaders) {
    baseHeaders = getRealUserHeaders();
  } else {
    // For JSON/API presets, use minimal headers
    baseHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: getAcceptHeader(preset),
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    };

    if (preset === "json" || preset === "api") {
      baseHeaders["Content-Type"] = "application/json";
    }
  }

  // Add optional headers
  if (referer) {
    baseHeaders.Referer = referer;
  }
  if (origin) {
    baseHeaders.Origin = origin;
  }

  return { ...baseHeaders, ...custom };
}

/**
 * Get headers specifically for HTML page fetching
 * Uses real browser fingerprints for anti-detection
 */
export function getHtmlHeaders(
  custom?: Record<string, string>,
): Record<string, string> {
  return getRequestHeaders({ preset: "html", custom }) as Record<
    string,
    string
  >;
}

/**
 * Get headers specifically for JSON API requests
 */
export function getJsonHeaders(
  custom?: Record<string, string>,
): Record<string, string> {
  return getRequestHeaders({ preset: "json", custom }) as Record<
    string,
    string
  >;
}

/**
 * Get headers specifically for API requests (minimal)
 */
export function getApiHeaders(
  custom?: Record<string, string>,
): Record<string, string> {
  return getRequestHeaders({ preset: "api", custom }) as Record<string, string>;
}

/**
 * Get headers that look like they're coming from the same site
 * Useful for API calls that need to appear as same-origin
 */
export function getSameOriginHeaders(
  origin: string,
  custom?: Record<string, string>,
): Record<string, string> {
  const headers = getRealUserHeaders();

  return {
    ...headers,
    Origin: origin,
    Referer: origin,
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    ...custom,
  };
}
