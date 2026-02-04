import type { RawMessage } from "../../../base";
import type { ClaudeMessage } from "./types";

interface GroupedMessage {
  sender: "human" | "assistant";
  text: string;
}

function getSortValue(message: ClaudeMessage): number {
  if (message.created_at) {
    const parsed = Date.parse(message.created_at);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return (message.index ?? 0) * 1000;
}

function normalizeArtifactToCodeBlock(text: string): string {
  const artifactRegex = /<antArtifact\s+([^>]+)>([\s\S]*?)<\/antArtifact>/gi;

  return text.replace(artifactRegex, (_fullMatch, attributes, body) => {
    const attributeText = typeof attributes === "string" ? attributes : "";
    const languageMatch = /language="([^"]+)"/i.exec(attributeText);
    const language = languageMatch?.[1] ?? "plaintext";
    const code = typeof body === "string" ? body.trim() : "";

    return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
  });
}

export function extractClaudeMessageText(message: ClaudeMessage): string {
  const contentText = Array.isArray(message.content)
    ? message.content
        .filter((item) => item.type === "text" && Boolean(item.text))
        .map((item) => item.text?.trim() ?? "")
        .filter(Boolean)
        .join("\n")
    : "";

  const fallbackText = message.text?.trim() ?? "";
  const merged = (contentText || fallbackText).trim();

  if (!merged) {
    return "";
  }

  return normalizeArtifactToCodeBlock(merged);
}

export function convertClaudeMessagesToRawMessages(
  messages: ClaudeMessage[],
): RawMessage[] {
  const grouped: GroupedMessage[] = [];

  const sorted = [...messages].sort(
    (left, right) => getSortValue(left) - getSortValue(right),
  );

  for (const message of sorted) {
    const text = extractClaudeMessageText(message);
    if (!text) {
      continue;
    }

    const sender = message.sender;
    const last = grouped[grouped.length - 1];

    if (last?.sender === sender) {
      last.text = `${last.text}\n${text}`.trim();
      continue;
    }

    grouped.push({ sender, text });
  }

  return grouped.map((item) => ({
    role: item.sender === "human" ? "user" : "assistant",
    content: item.text,
  }));
}
