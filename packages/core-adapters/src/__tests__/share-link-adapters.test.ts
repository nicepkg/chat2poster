/**
 * Share Link Adapter Tests
 *
 * Tests for ChatGPT, Claude, and Gemini share link adapters.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  chatGPTShareLinkAdapter,
  claudeShareLinkAdapter,
  geminiShareLinkAdapter,
  registerAdapter,
  clearAdapters,
} from "../index";

describe("ChatGPTShareLinkAdapter", () => {
  describe("canHandle", () => {
    it("should handle chatgpt.com share links", () => {
      expect(
        chatGPTShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://chatgpt.com/share/abc123",
        }),
      ).toBe(true);
    });

    it("should handle chatgpt.com /s/ links", () => {
      expect(
        chatGPTShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://chatgpt.com/s/t_abc123",
        }),
      ).toBe(true);
    });

    it("should handle chat.openai.com share links", () => {
      expect(
        chatGPTShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://chat.openai.com/share/abc123",
        }),
      ).toBe(true);
    });

    it("should not handle non-share URLs", () => {
      expect(
        chatGPTShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://chatgpt.com/c/abc123",
        }),
      ).toBe(false);
    });

    it("should not handle non-share-link input types", () => {
      expect(
        chatGPTShareLinkAdapter.canHandle({
          type: "manual",
          messages: [{ role: "user", content: "test" }],
        }),
      ).toBe(false);
    });
  });

  describe("adapter properties", () => {
    it("should have correct id", () => {
      expect(chatGPTShareLinkAdapter.id).toBe("chatgpt-share-link");
    });

    it("should have correct provider", () => {
      expect(chatGPTShareLinkAdapter.provider).toBe("chatgpt");
    });

    it("should have version", () => {
      expect(chatGPTShareLinkAdapter.version).toBe("2.0.0");
    });
  });
});

describe("GeminiShareLinkAdapter", () => {
  describe("canHandle", () => {
    it("should handle gemini.google.com share links", () => {
      expect(
        geminiShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://gemini.google.com/share/abc123",
        }),
      ).toBe(true);
    });

    it("should not handle non-share URLs", () => {
      expect(
        geminiShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://gemini.google.com/app/abc123",
        }),
      ).toBe(false);
    });

    it("should not handle other domains", () => {
      expect(
        geminiShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://chatgpt.com/share/abc123",
        }),
      ).toBe(false);
    });
  });

  describe("adapter properties", () => {
    it("should have correct id", () => {
      expect(geminiShareLinkAdapter.id).toBe("gemini-share-link");
    });

    it("should have correct provider", () => {
      expect(geminiShareLinkAdapter.provider).toBe("gemini");
    });

    it("should have version", () => {
      expect(geminiShareLinkAdapter.version).toBe("1.0.0");
    });
  });
});

describe("ClaudeShareLinkAdapter", () => {
  describe("canHandle", () => {
    it("should handle claude.ai share links", () => {
      expect(
        claudeShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://claude.ai/share/3745d94b-a9cc-405f-93f8-c67b24fc205c",
        }),
      ).toBe(true);
    });

    it("should not handle non-share Claude URLs", () => {
      expect(
        claudeShareLinkAdapter.canHandle({
          type: "share-link",
          url: "https://claude.ai/chat/e939f454-b683-45d5-bdbc-de6154a2ec8d",
        }),
      ).toBe(false);
    });
  });

  describe("adapter properties", () => {
    it("should have correct id", () => {
      expect(claudeShareLinkAdapter.id).toBe("claude-share-link");
    });

    it("should have correct provider", () => {
      expect(claudeShareLinkAdapter.provider).toBe("claude");
    });

    it("should have version", () => {
      expect(claudeShareLinkAdapter.version).toBe("2.0.0");
    });
  });
});

describe("Share link adapter registration", () => {
  beforeEach(() => {
    clearAdapters();
  });

  it("should register ChatGPT share link adapter", () => {
    registerAdapter(chatGPTShareLinkAdapter);

    // Verify it can be found for share-link input
    const input = {
      type: "share-link" as const,
      url: "https://chatgpt.com/share/abc123",
    };

    expect(chatGPTShareLinkAdapter.canHandle(input)).toBe(true);
  });

  it("should register Gemini share link adapter", () => {
    registerAdapter(geminiShareLinkAdapter);

    const input = {
      type: "share-link" as const,
      url: "https://gemini.google.com/share/abc123",
    };

    expect(geminiShareLinkAdapter.canHandle(input)).toBe(true);
  });

  it("should register Claude share link adapter", () => {
    registerAdapter(claudeShareLinkAdapter);

    const input = {
      type: "share-link" as const,
      url: "https://claude.ai/share/3745d94b-a9cc-405f-93f8-c67b24fc205c",
    };

    expect(claudeShareLinkAdapter.canHandle(input)).toBe(true);
  });

  it("should find correct adapter for each provider", () => {
    registerAdapter(chatGPTShareLinkAdapter);
    registerAdapter(geminiShareLinkAdapter);

    // ChatGPT
    expect(
      chatGPTShareLinkAdapter.canHandle({
        type: "share-link",
        url: "https://chatgpt.com/share/test",
      }),
    ).toBe(true);
    // Gemini
    expect(
      geminiShareLinkAdapter.canHandle({
        type: "share-link",
        url: "https://gemini.google.com/share/xyz",
      }),
    ).toBe(true);
    expect(
      chatGPTShareLinkAdapter.canHandle({
        type: "share-link",
        url: "https://gemini.google.com/share/xyz",
      }),
    ).toBe(false);

    // Claude
    expect(
      claudeShareLinkAdapter.canHandle({
        type: "share-link",
        url: "https://claude.ai/share/3745d94b-a9cc-405f-93f8-c67b24fc205c",
      }),
    ).toBe(true);
  });
});
