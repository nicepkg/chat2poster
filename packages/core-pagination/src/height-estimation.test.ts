import { describe, it, expect } from "vitest";
import {
  estimateMessageHeight,
  estimateMessagesHeight,
  analyzeContentMeta,
  DEFAULT_HEIGHT_CONFIG,
} from "./height-estimation";
import type { Message } from "@chat2poster/core-schema";

// Helper to create a test message
function createTestMessage(
  contentMarkdown: string,
  overrides: Partial<Message> = {}
): Message {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    contentMarkdown,
    order: 0,
    ...overrides,
  };
}

describe("estimateMessageHeight", () => {
  it("should return minimum height for empty message", () => {
    const msg = createTestMessage("");
    const height = estimateMessageHeight(msg);

    expect(height).toBe(DEFAULT_HEIGHT_CONFIG.minMessageHeightPx);
  });

  it("should estimate height for simple text", () => {
    const msg = createTestMessage("Hello, this is a simple message.");
    const height = estimateMessageHeight(msg);

    // Should be base + at least one line
    expect(height).toBeGreaterThan(DEFAULT_HEIGHT_CONFIG.baseMessageHeightPx);
  });

  it("should estimate higher for longer text", () => {
    const shortMsg = createTestMessage("Short message.");
    const longMsg = createTestMessage(
      "This is a much longer message that spans multiple lines. ".repeat(10)
    );

    const shortHeight = estimateMessageHeight(shortMsg);
    const longHeight = estimateMessageHeight(longMsg);

    expect(longHeight).toBeGreaterThan(shortHeight);
  });

  it("should account for code blocks", () => {
    const msgWithoutCode = createTestMessage("No code here.");
    const msgWithCode = createTestMessage(`
Some text before.

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
  return true;
}
\`\`\`

Some text after.
    `);

    const heightWithoutCode = estimateMessageHeight(msgWithoutCode);
    const heightWithCode = estimateMessageHeight(msgWithCode);

    expect(heightWithCode).toBeGreaterThan(heightWithoutCode);
  });

  it("should account for images", () => {
    const msgWithoutImage = createTestMessage("No image here.");
    const msgWithImage = createTestMessage(
      "Here is an image: ![alt text](https://example.com/image.png)"
    );

    const heightWithoutImage = estimateMessageHeight(msgWithoutImage);
    const heightWithImage = estimateMessageHeight(msgWithImage);

    expect(heightWithImage).toBeGreaterThan(heightWithoutImage);
    expect(heightWithImage - heightWithoutImage).toBeGreaterThanOrEqual(
      DEFAULT_HEIGHT_CONFIG.imageHeightPx - DEFAULT_HEIGHT_CONFIG.lineHeightPx
    );
  });

  it("should use pre-computed height when available", () => {
    const msg = createTestMessage("Some text", {
      contentMeta: {
        approxHeightPx: 500,
      },
    });

    const height = estimateMessageHeight(msg);
    expect(height).toBe(500);
  });

  it("should handle multiple code blocks", () => {
    const msg = createTestMessage(`
\`\`\`js
const a = 1;
\`\`\`

Some text.

\`\`\`python
def hello():
    print("Hello")
\`\`\`
    `);

    const height = estimateMessageHeight(msg);
    // Should account for both code blocks
    expect(height).toBeGreaterThan(
      DEFAULT_HEIGHT_CONFIG.baseMessageHeightPx +
        DEFAULT_HEIGHT_CONFIG.codeBlockHeightPx * 2
    );
  });

  it("should handle inline code without over-estimating", () => {
    const msgWithInlineCode = createTestMessage(
      "Use `const` and `let` for variables."
    );
    const msgWithoutInlineCode = createTestMessage(
      "Use const and let for variables."
    );

    const heightWith = estimateMessageHeight(msgWithInlineCode);
    const heightWithout = estimateMessageHeight(msgWithoutInlineCode);

    // Inline code should add only a small amount
    expect(heightWith - heightWithout).toBeLessThan(20);
  });
});

describe("estimateMessagesHeight", () => {
  it("should return 0 for empty array", () => {
    const height = estimateMessagesHeight([]);
    expect(height).toBe(0);
  });

  it("should sum heights of multiple messages", () => {
    const messages = [
      createTestMessage("Message 1"),
      createTestMessage("Message 2"),
      createTestMessage("Message 3"),
    ];

    const totalHeight = estimateMessagesHeight(messages);
    const individualSum = messages.reduce(
      (sum, msg) => sum + estimateMessageHeight(msg),
      0
    );

    expect(totalHeight).toBe(individualSum);
  });
});

describe("analyzeContentMeta", () => {
  it("should detect code blocks", () => {
    const result = analyzeContentMeta("```js\ncode\n```");
    expect(result.containsCodeBlock).toBe(true);
  });

  it("should detect images", () => {
    const result = analyzeContentMeta("![alt](url.png)");
    expect(result.containsImage).toBe(true);
  });

  it("should return false for plain text", () => {
    const result = analyzeContentMeta("Just plain text here.");
    expect(result.containsCodeBlock).toBe(false);
    expect(result.containsImage).toBe(false);
  });

  it("should detect both code and images", () => {
    const result = analyzeContentMeta(`
\`\`\`js
code
\`\`\`

![image](url.png)
    `);
    expect(result.containsCodeBlock).toBe(true);
    expect(result.containsImage).toBe(true);
  });
});
