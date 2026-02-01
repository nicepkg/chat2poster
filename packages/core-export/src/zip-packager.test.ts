import { describe, it, expect } from "vitest";
import { generatePageFilename, generateZipFilename } from "./zip-packager";

describe("generatePageFilename", () => {
  it("should generate filename with correct padding for single digit", () => {
    const filename = generatePageFilename(0, 9);
    expect(filename).toBe("page_1.png");
  });

  it("should generate filename with correct padding for double digits", () => {
    const filename = generatePageFilename(0, 10);
    expect(filename).toBe("page_01.png");
  });

  it("should generate filename with correct padding for triple digits", () => {
    const filename = generatePageFilename(0, 100);
    expect(filename).toBe("page_001.png");
  });

  it("should use custom base name", () => {
    const filename = generatePageFilename(0, 5, "export");
    expect(filename).toBe("export_1.png");
  });

  it("should use custom extension", () => {
    const filename = generatePageFilename(0, 5, "page", "jpg");
    expect(filename).toBe("page_1.jpg");
  });

  it("should handle middle page correctly", () => {
    const filename = generatePageFilename(4, 10);
    expect(filename).toBe("page_05.png");
  });

  it("should handle last page correctly", () => {
    const filename = generatePageFilename(9, 10);
    expect(filename).toBe("page_10.png");
  });
});

describe("generateZipFilename", () => {
  it("should generate filename with default title", () => {
    const filename = generateZipFilename();
    expect(filename).toMatch(/^conversation_\d{4}-\d{2}-\d{2}\.zip$/);
  });

  it("should use provided title", () => {
    const filename = generateZipFilename("My Chat");
    expect(filename).toMatch(/^My_Chat_\d{4}-\d{2}-\d{2}\.zip$/);
  });

  it("should sanitize special characters in title", () => {
    const filename = generateZipFilename("Chat: Test? File!");
    expect(filename).not.toContain(":");
    expect(filename).not.toContain("?");
    expect(filename).not.toContain("!");
  });

  it("should use provided date", () => {
    const date = new Date("2024-06-15");
    const filename = generateZipFilename("Test", date);
    expect(filename).toBe("Test_2024-06-15.zip");
  });

  it("should truncate long titles", () => {
    const longTitle = "A".repeat(100);
    const filename = generateZipFilename(longTitle);
    // Should be limited to 50 chars + date + .zip
    expect(filename.length).toBeLessThan(70);
  });

  it("should preserve Chinese characters", () => {
    const filename = generateZipFilename("聊天记录");
    expect(filename).toContain("聊天记录");
  });
});
