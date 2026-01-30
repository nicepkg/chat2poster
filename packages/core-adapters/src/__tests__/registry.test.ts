/**
 * Registry Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { Adapter, AdapterInput, Conversation } from "@chat2poster/core-schema";
import {
  registerAdapter,
  unregisterAdapter,
  getAdapters,
  getAdapter,
  parseWithAdapters,
  clearAdapters,
} from "../registry";
import { generateId } from "../base";

// Mock adapter for testing
function createMockAdapter(config: {
  id: string;
  version?: string;
  name?: string;
  canHandle?: (input: AdapterInput) => boolean;
  parse?: (input: AdapterInput) => Promise<Conversation>;
}): Adapter {
  return {
    id: config.id,
    version: config.version ?? "1.0.0",
    name: config.name ?? "Mock Adapter",
    canHandle: config.canHandle ?? (() => true),
    parse:
      config.parse ??
      (async () => ({
        id: generateId(),
        sourceType: "extension-current" as const,
        messages: [],
        sourceMeta: {
          provider: "chatgpt" as const,
          parsedAt: new Date().toISOString(),
          adapterId: config.id,
          adapterVersion: config.version ?? "1.0.0",
        },
      })),
  };
}

describe("Adapter Registry", () => {
  beforeEach(() => {
    clearAdapters();
  });

  describe("registerAdapter", () => {
    it("should register an adapter", () => {
      const adapter = createMockAdapter({ id: "test-adapter" });
      registerAdapter(adapter);

      expect(getAdapters()).toContain(adapter);
      expect(getAdapter("test-adapter")).toBe(adapter);
    });

    it("should throw when registering duplicate adapter id", () => {
      const adapter1 = createMockAdapter({ id: "test-adapter" });
      const adapter2 = createMockAdapter({ id: "test-adapter" });

      registerAdapter(adapter1);
      expect(() => registerAdapter(adapter2)).toThrow(/already registered/);
    });

    it("should allow registering multiple different adapters", () => {
      const adapter1 = createMockAdapter({ id: "adapter-1" });
      const adapter2 = createMockAdapter({ id: "adapter-2" });

      registerAdapter(adapter1);
      registerAdapter(adapter2);

      expect(getAdapters()).toHaveLength(2);
    });
  });

  describe("unregisterAdapter", () => {
    it("should remove a registered adapter", () => {
      const adapter = createMockAdapter({ id: "test-adapter" });
      registerAdapter(adapter);

      const result = unregisterAdapter("test-adapter");

      expect(result).toBe(true);
      expect(getAdapter("test-adapter")).toBeUndefined();
    });

    it("should return false for non-existent adapter", () => {
      const result = unregisterAdapter("non-existent");
      expect(result).toBe(false);
    });
  });

  describe("getAdapters", () => {
    it("should return empty array when no adapters registered", () => {
      expect(getAdapters()).toEqual([]);
    });

    it("should return all registered adapters", () => {
      const adapter1 = createMockAdapter({ id: "adapter-1" });
      const adapter2 = createMockAdapter({ id: "adapter-2" });

      registerAdapter(adapter1);
      registerAdapter(adapter2);

      const adapters = getAdapters();
      expect(adapters).toContain(adapter1);
      expect(adapters).toContain(adapter2);
    });
  });

  describe("getAdapter", () => {
    it("should return undefined for non-existent adapter", () => {
      expect(getAdapter("non-existent")).toBeUndefined();
    });

    it("should return the correct adapter by id", () => {
      const adapter = createMockAdapter({ id: "test-adapter" });
      registerAdapter(adapter);

      expect(getAdapter("test-adapter")).toBe(adapter);
    });
  });

  describe("parseWithAdapters", () => {
    it("should throw E-PARSE-001 when no adapters can handle input", async () => {
      const adapter = createMockAdapter({
        id: "test-adapter",
        canHandle: () => false,
      });
      registerAdapter(adapter);

      const input: AdapterInput = {
        type: "dom",
        document: document,
        url: "https://example.com",
      };

      await expect(parseWithAdapters(input)).rejects.toMatchObject({
        code: "E-PARSE-001",
      });
    });

    it("should use the first adapter that can handle the input", async () => {
      const adapter1 = createMockAdapter({
        id: "adapter-1",
        canHandle: () => false,
      });

      const adapter2 = createMockAdapter({
        id: "adapter-2",
        canHandle: () => true,
        parse: async () => ({
          id: "test-conv-id",
          sourceType: "extension-current",
          messages: [
            {
              id: "msg-1",
              role: "user",
              contentMarkdown: "Hello",
              order: 0,
            },
          ],
          sourceMeta: {
            provider: "chatgpt",
            parsedAt: new Date().toISOString(),
            adapterId: "adapter-2",
            adapterVersion: "1.0.0",
          },
        }),
      });

      registerAdapter(adapter1);
      registerAdapter(adapter2);

      const input: AdapterInput = {
        type: "dom",
        document: document,
        url: "https://example.com",
      };

      const result = await parseWithAdapters(input);
      expect(result.adapterId).toBe("adapter-2");
      expect(result.conversation.messages).toHaveLength(1);
    });

    it("should try next adapter if first one fails", async () => {
      const adapter1 = createMockAdapter({
        id: "adapter-1",
        canHandle: () => true,
        parse: async () => {
          throw new Error("Failed");
        },
      });

      const adapter2 = createMockAdapter({
        id: "adapter-2",
        canHandle: () => true,
        parse: async () => ({
          id: "test-conv-id",
          sourceType: "extension-current",
          messages: [],
          sourceMeta: {
            provider: "chatgpt",
            parsedAt: new Date().toISOString(),
            adapterId: "adapter-2",
            adapterVersion: "1.0.0",
          },
        }),
      });

      registerAdapter(adapter1);
      registerAdapter(adapter2);

      const input: AdapterInput = {
        type: "dom",
        document: document,
        url: "https://example.com",
      };

      const result = await parseWithAdapters(input);
      expect(result.adapterId).toBe("adapter-2");
    });

    it("should return ParseResult with adapter info", async () => {
      const adapter = createMockAdapter({
        id: "test-adapter",
        version: "2.0.0",
        canHandle: () => true,
      });
      registerAdapter(adapter);

      const input: AdapterInput = {
        type: "dom",
        document: document,
        url: "https://example.com",
      };

      const result = await parseWithAdapters(input);
      expect(result.adapterId).toBe("test-adapter");
      expect(result.adapterVersion).toBe("2.0.0");
      expect(result.conversation).toBeDefined();
    });
  });

  describe("clearAdapters", () => {
    it("should remove all registered adapters", () => {
      registerAdapter(createMockAdapter({ id: "adapter-1" }));
      registerAdapter(createMockAdapter({ id: "adapter-2" }));

      expect(getAdapters()).toHaveLength(2);

      clearAdapters();

      expect(getAdapters()).toHaveLength(0);
    });
  });
});
