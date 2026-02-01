/**
 * Network Utilities
 *
 * Unified HTTP request utilities for external API calls.
 * Provides consistent headers, error handling, and fetch helpers.
 */

// User-Agent generation
export {
  generateChromeUserAgent,
  generateFirefoxUserAgent,
} from "./user-agent";

// Headers generation
export {
  getRealUserHeaders,
  getRequestHeaders,
  getHtmlHeaders,
  getJsonHeaders,
  getApiHeaders,
  getSameOriginHeaders,
} from "./headers";
export type { HeaderPreset, HeaderOptions } from "./headers";

// Fetch utilities
export {
  fetchExternal,
  fetchHtml,
  fetchJson,
  isUrlReachable,
  getRedirectUrl,
} from "./fetcher";
export type { FetchOptions, FetchResult } from "./fetcher";
