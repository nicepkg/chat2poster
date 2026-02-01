/**
 * Unified Fetch Wrapper
 *
 * Provides a consistent interface for external HTTP requests with:
 * - Automatic header generation
 * - Error handling
 * - Response type helpers
 * - Retry support
 */

import {
  getApiHeaders,
  getHtmlHeaders,
  getJsonHeaders,
  getRequestHeaders,
  type HeaderOptions,
} from "./headers";

/**
 * Configuration for fetch requests
 */
export interface FetchOptions extends Omit<RequestInit, "headers"> {
  /**
   * Header options or custom headers
   */
  headers?: HeaderOptions | HeadersInit;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Number of retry attempts on failure
   * @default 0
   */
  retries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;
}

/**
 * Fetch result with typed response helpers
 */
export interface FetchResult {
  response: Response;
  /**
   * Get response as text
   */
  text: () => Promise<string>;
  /**
   * Get response as JSON
   */
  json: <T = unknown>() => Promise<T>;
  /**
   * Get response as ArrayBuffer
   */
  arrayBuffer: () => Promise<ArrayBuffer>;
  /**
   * Get response as Blob
   */
  blob: () => Promise<Blob>;
  /**
   * Check if response is OK (2xx)
   */
  ok: boolean;
  /**
   * HTTP status code
   */
  status: number;
  /**
   * HTTP status text
   */
  statusText: string;
  /**
   * Final URL after redirects
   */
  url: string;
}

/**
 * Check if a value is HeaderOptions
 */
function isHeaderOptions(value: unknown): value is HeaderOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Headers) &&
    ("preset" in value || "randomUserAgent" in value || "custom" in value)
  );
}

/**
 * Resolve headers from options
 */
function resolveHeaders(
  headers?: HeaderOptions | HeadersInit,
): Record<string, string> {
  if (!headers) {
    return getRequestHeaders() as Record<string, string>;
  }

  if (isHeaderOptions(headers)) {
    return getRequestHeaders(headers) as Record<string, string>;
  }

  // Convert HeadersInit to Record<string, string>
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    const result: Record<string, string> = {};
    for (const [key, value] of headers) {
      result[key] = value;
    }
    return result;
  }

  return headers;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Perform a fetch request with automatic headers and error handling
 *
 * @example
 * ```ts
 * // Simple HTML fetch
 * const result = await fetchExternal('https://example.com');
 * const html = await result.text();
 *
 * // JSON API request
 * const result = await fetchExternal('https://api.example.com/data', {
 *   headers: { preset: 'json' }
 * });
 * const data = await result.json<MyType>();
 *
 * // With retry
 * const result = await fetchExternal('https://api.example.com/data', {
 *   retries: 3,
 *   retryDelay: 2000
 * });
 * ```
 */
export async function fetchExternal(
  url: string,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const {
    headers,
    timeout = 30000,
    retries = 0,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const resolvedHeaders = resolveHeaders(headers);
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: resolvedHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        response,
        text: () => response.text(),
        json: <T>() => response.json() as Promise<T>,
        arrayBuffer: () => response.arrayBuffer(),
        blob: () => response.blob(),
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        await sleep(retryDelay);
        attempt++;
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error("Fetch failed");
}

/**
 * Fetch an HTML page with appropriate headers
 *
 * @example
 * ```ts
 * const html = await fetchHtml('https://example.com/page');
 * ```
 */
export async function fetchHtml(
  url: string,
  options: Omit<FetchOptions, "headers"> = {},
): Promise<string> {
  const result = await fetchExternal(url, {
    ...options,
    headers: getHtmlHeaders(),
  });

  if (!result.ok) {
    throw new Error(`HTTP ${result.status}: ${result.statusText}`);
  }

  return result.text();
}

/**
 * Fetch JSON data with appropriate headers
 *
 * @example
 * ```ts
 * const data = await fetchJson<MyType>('https://api.example.com/data');
 * ```
 */
export async function fetchJson<T = unknown>(
  url: string,
  options: Omit<FetchOptions, "headers"> = {},
): Promise<T> {
  const result = await fetchExternal(url, {
    ...options,
    headers: getJsonHeaders(),
  });

  if (!result.ok) {
    throw new Error(`HTTP ${result.status}: ${result.statusText}`);
  }

  return result.json<T>();
}

/**
 * Check if a URL is reachable (HEAD request)
 */
export async function isUrlReachable(
  url: string,
  timeout = 5000,
): Promise<boolean> {
  try {
    const result = await fetchExternal(url, {
      method: "HEAD",
      timeout,
      headers: getApiHeaders(),
    });
    return result.ok;
  } catch {
    return false;
  }
}

/**
 * Follow redirects and get the final URL
 */
export async function getRedirectUrl(url: string): Promise<string> {
  const result = await fetchExternal(url, {
    method: "HEAD",
    redirect: "follow",
    headers: getApiHeaders(),
  });
  return result.url;
}
