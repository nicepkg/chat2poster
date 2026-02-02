/**
 * Adapter Registry
 *
 * Plugin-style registry for conversation adapters.
 * New adapters only need to register once - no switch-case modifications required.
 */

import type {
  Adapter,
  AdapterInput,
  AdapterMeta,
  Conversation,
  AppError,
} from "@chat2poster/core-schema";
import { createAppError } from "@chat2poster/core-schema";

/**
 * Internal adapter storage
 */
const adapters = new Map<string, Adapter>();

/**
 * Register an adapter with the registry
 * @param adapter The adapter to register
 * @throws Error if adapter with same id is already registered
 */
export function registerAdapter(adapter: Adapter): void {
  if (adapters.has(adapter.id)) {
    throw new Error(
      `Adapter with id "${adapter.id}" is already registered. Use unregisterAdapter first if you need to replace it.`,
    );
  }
  adapters.set(adapter.id, adapter);
}

/**
 * Unregister an adapter from the registry
 * @param adapterId The id of the adapter to unregister
 * @returns true if adapter was removed, false if it wasn't registered
 */
export function unregisterAdapter(adapterId: string): boolean {
  return adapters.delete(adapterId);
}

/**
 * Get all registered adapters
 * @returns Array of registered adapters
 */
export function getAdapters(): Adapter[] {
  return Array.from(adapters.values());
}

/**
 * Get a specific adapter by id
 * @param adapterId The id of the adapter to get
 * @returns The adapter or undefined if not found
 */
export function getAdapter(adapterId: string): Adapter | undefined {
  return adapters.get(adapterId);
}

/**
 * Get adapter metadata for all registered adapters
 * @returns Array of adapter metadata
 */
export function getAdaptersMeta(): AdapterMeta[] {
  return getAdapters().map((adapter) => ({
    id: adapter.id,
    version: adapter.version,
    name: adapter.name,
    supportedInputTypes: [...adapter.supportedInputTypes],
  }));
}

/**
 * Result of parsing with adapters
 */
export interface ParseResult {
  conversation: Conversation;
  adapterId: string;
  adapterVersion: string;
}

/**
 * Parse input using registered adapters
 * Tries each adapter in order until one succeeds
 *
 * @param input The input to parse
 * @returns ParseResult with the conversation and adapter info
 * @throws AppError if no adapter can handle the input
 */
export async function parseWithAdapters(
  input: AdapterInput,
): Promise<ParseResult> {
  // Find adapters that can handle this input
  const compatibleAdapters = getAdapters().filter((adapter) => {
    try {
      return adapter.canHandle(input);
    } catch {
      return false;
    }
  });

  if (compatibleAdapters.length === 0) {
    throw createAppError(
      "E-PARSE-001",
      `No adapter found for input type "${input.type}"`,
    );
  }

  // Try each compatible adapter until one succeeds
  let lastError: AppError | Error | undefined;

  for (const adapter of compatibleAdapters) {
    try {
      const conversation = await adapter.parse(input);
      return {
        conversation,
        adapterId: adapter.id,
        adapterVersion: adapter.version,
      };
    } catch (error) {
      lastError = error as AppError | Error;
      // Continue to next adapter
    }
  }

  // All adapters failed
  if (lastError && "code" in lastError) {
    throw lastError;
  }

  throw createAppError(
    "E-PARSE-002",
    lastError?.message ?? "All compatible adapters failed to parse input",
  );
}

/**
 * Clear all registered adapters (useful for testing)
 */
export function clearAdapters(): void {
  adapters.clear();
}

/**
 * Find an adapter that can handle a given share link URL
 * @param url The share link URL to check
 * @returns The adapter that can handle the URL, or null if none found
 */
export function findAdapterForUrl(url: string): Adapter | null {
  const input: AdapterInput = { type: "share-link", url };
  return (
    getAdapters().find((adapter) => {
      try {
        return adapter.canHandle(input);
      } catch {
        return false;
      }
    }) ?? null
  );
}

/**
 * Check if any registered adapter can handle a share link URL
 * @param url The share link URL to check
 * @returns true if an adapter can handle the URL
 */
export function canHandleShareLink(url: string): boolean {
  return findAdapterForUrl(url) !== null;
}
