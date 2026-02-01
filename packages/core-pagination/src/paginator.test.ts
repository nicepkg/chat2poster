import type { Message, Selection } from "@chat2poster/core-schema";
import { describe, it, expect } from "vitest";
import {
  paginate,
  needsPagination,
  suggestPageBreaks,
  getPageHeights,
  getEstimatedTotalHeight,
} from "./paginator";

// Helper to create test messages
function createTestMessage(
  id: string,
  content: string,
  order: number,
): Message {
  return {
    id,
    role: "assistant",
    contentMarkdown: content,
    order,
  };
}

// Helper to create test selection
function createTestSelection(
  conversationId: string,
  messageIds: string[],
  pageBreaks: { id: string; afterMessageId: string }[] = [],
): Selection {
  return {
    conversationId,
    selectedMessageIds: messageIds,
    pageBreaks: pageBreaks.map((pb) => ({
      ...pb,
      createdAt: new Date().toISOString(),
    })),
  };
}

describe("paginate", () => {
  it("should return empty result for empty selection", () => {
    const messages: Message[] = [];
    const selection = createTestSelection("conv-1", []);

    const result = paginate(messages, selection);

    expect(result.pages).toEqual([]);
    expect(result.totalPages).toBe(0);
  });

  it("should return single page when content fits", () => {
    const messages = [
      createTestMessage("msg-1", "Hello", 0),
      createTestMessage("msg-2", "World", 1),
    ];
    const selection = createTestSelection("conv-1", ["msg-1", "msg-2"]);

    const result = paginate(messages, selection);

    expect(result.totalPages).toBe(1);
    expect(result.pages[0]).toEqual(["msg-1", "msg-2"]);
  });

  it("should respect manual page breaks", () => {
    const messages = [
      createTestMessage("msg-1", "Message 1", 0),
      createTestMessage("msg-2", "Message 2", 1),
      createTestMessage("msg-3", "Message 3", 2),
    ];
    const selection = createTestSelection(
      "conv-1",
      ["msg-1", "msg-2", "msg-3"],
      [{ id: "pb-1", afterMessageId: "msg-1" }],
    );

    const result = paginate(messages, selection);

    expect(result.totalPages).toBe(2);
    expect(result.pages[0]).toEqual(["msg-1"]);
    expect(result.pages[1]).toEqual(["msg-2", "msg-3"]);
  });

  it("should respect multiple manual page breaks", () => {
    const messages = [
      createTestMessage("msg-1", "Message 1", 0),
      createTestMessage("msg-2", "Message 2", 1),
      createTestMessage("msg-3", "Message 3", 2),
    ];
    const selection = createTestSelection(
      "conv-1",
      ["msg-1", "msg-2", "msg-3"],
      [
        { id: "pb-1", afterMessageId: "msg-1" },
        { id: "pb-2", afterMessageId: "msg-2" },
      ],
    );

    const result = paginate(messages, selection);

    expect(result.totalPages).toBe(3);
    expect(result.pages[0]).toEqual(["msg-1"]);
    expect(result.pages[1]).toEqual(["msg-2"]);
    expect(result.pages[2]).toEqual(["msg-3"]);
  });

  it("should auto-paginate when content exceeds max height", () => {
    // Create messages that will exceed the default max height
    const longContent = "Long content. ".repeat(100);
    const messages = [
      createTestMessage("msg-1", longContent, 0),
      createTestMessage("msg-2", longContent, 1),
      createTestMessage("msg-3", longContent, 2),
      createTestMessage("msg-4", longContent, 3),
      createTestMessage("msg-5", longContent, 4),
    ];
    const selection = createTestSelection("conv-1", [
      "msg-1",
      "msg-2",
      "msg-3",
      "msg-4",
      "msg-5",
    ]);

    const result = paginate(messages, selection, { maxPageHeightPx: 500 });

    expect(result.totalPages).toBeGreaterThan(1);
  });

  it("should return single page when auto pagination is disabled", () => {
    const longContent = "Long content. ".repeat(100);
    const messages = [
      createTestMessage("msg-1", longContent, 0),
      createTestMessage("msg-2", longContent, 1),
    ];
    const selection = createTestSelection("conv-1", ["msg-1", "msg-2"]);

    const result = paginate(messages, selection, { autoEnabled: false });

    expect(result.totalPages).toBe(1);
    expect(result.pages[0]).toEqual(["msg-1", "msg-2"]);
  });

  it("should only include selected messages", () => {
    const messages = [
      createTestMessage("msg-1", "Message 1", 0),
      createTestMessage("msg-2", "Message 2", 1),
      createTestMessage("msg-3", "Message 3", 2),
    ];
    const selection = createTestSelection("conv-1", ["msg-1", "msg-3"]); // Skip msg-2

    const result = paginate(messages, selection);

    expect(result.totalPages).toBe(1);
    expect(result.pages[0]).toEqual(["msg-1", "msg-3"]);
  });

  it("should be deterministic (same input = same output)", () => {
    const messages = [
      createTestMessage("msg-1", "Long message ".repeat(50), 0),
      createTestMessage("msg-2", "Another long message ".repeat(50), 1),
      createTestMessage("msg-3", "Third long message ".repeat(50), 2),
    ];
    const selection = createTestSelection("conv-1", [
      "msg-1",
      "msg-2",
      "msg-3",
    ]);

    const result1 = paginate(messages, selection, { maxPageHeightPx: 500 });
    const result2 = paginate(messages, selection, { maxPageHeightPx: 500 });

    expect(result1.pages).toEqual(result2.pages);
    expect(result1.totalPages).toEqual(result2.totalPages);
  });
});

describe("needsPagination", () => {
  it("should return false for short content", () => {
    const messages = [
      createTestMessage("msg-1", "Short", 0),
      createTestMessage("msg-2", "Content", 1),
    ];

    const result = needsPagination(messages);
    expect(result).toBe(false);
  });

  it("should return true when content exceeds max height", () => {
    const longContent = "Very long content ".repeat(200);
    const messages = [createTestMessage("msg-1", longContent, 0)];

    const result = needsPagination(messages, { maxPageHeightPx: 500 });
    expect(result).toBe(true);
  });
});

describe("suggestPageBreaks", () => {
  it("should return empty array for short content", () => {
    const messages = [
      createTestMessage("msg-1", "Short", 0),
      createTestMessage("msg-2", "Content", 1),
    ];

    const breaks = suggestPageBreaks(messages);
    expect(breaks).toEqual([]);
  });

  it("should suggest breaks for long content", () => {
    const longContent = "Long content ".repeat(100);
    const messages = [
      createTestMessage("msg-1", longContent, 0),
      createTestMessage("msg-2", longContent, 1),
      createTestMessage("msg-3", longContent, 2),
    ];

    const breaks = suggestPageBreaks(messages, { maxPageHeightPx: 500 });
    expect(breaks.length).toBeGreaterThan(0);
    expect(breaks[0]!.afterMessageId).toBeDefined();
  });

  it("should generate valid PageBreak objects", () => {
    const longContent = "Long content ".repeat(100);
    const messages = [
      createTestMessage("msg-1", longContent, 0),
      createTestMessage("msg-2", longContent, 1),
    ];

    const breaks = suggestPageBreaks(messages, { maxPageHeightPx: 500 });

    for (const pb of breaks) {
      expect(pb.id).toBeDefined();
      expect(pb.afterMessageId).toBeDefined();
      expect(pb.label).toBeDefined();
    }
  });
});

describe("getPageHeights", () => {
  it("should return empty array for empty result", () => {
    const heights = getPageHeights([], { pages: [], totalPages: 0 });
    expect(heights).toEqual([]);
  });

  it("should calculate height for each page", () => {
    const messages = [
      createTestMessage("msg-1", "Message 1", 0),
      createTestMessage("msg-2", "Message 2", 1),
      createTestMessage("msg-3", "Message 3", 2),
    ];

    const paginationResult = {
      pages: [["msg-1"], ["msg-2", "msg-3"]],
      totalPages: 2,
    };

    const heights = getPageHeights(messages, paginationResult);

    expect(heights.length).toBe(2);
    expect(heights[0]).toBeGreaterThan(0);
    expect(heights[1]).toBeGreaterThan(heights[0]!); // Second page has 2 messages
  });
});

describe("getEstimatedTotalHeight", () => {
  it("should return 0 for empty array", () => {
    const height = getEstimatedTotalHeight([]);
    expect(height).toBe(0);
  });

  it("should sum heights of all messages", () => {
    const messages = [
      createTestMessage("msg-1", "Message 1", 0),
      createTestMessage("msg-2", "Message 2", 1),
    ];

    const height = getEstimatedTotalHeight(messages);
    expect(height).toBeGreaterThan(0);
  });
});
