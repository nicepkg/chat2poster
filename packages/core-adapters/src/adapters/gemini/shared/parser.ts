import type { RawMessage } from "../../../base";

function findRpcPayload(node: unknown, rpcId: string): string | null {
  if (!Array.isArray(node)) {
    return null;
  }

  if (
    node.length >= 3 &&
    node[0] === "wrb.fr" &&
    node[1] === rpcId &&
    typeof node[2] === "string"
  ) {
    return node[2];
  }

  for (const child of node) {
    const payload = findRpcPayload(child, rpcId);
    if (payload) {
      return payload;
    }
  }

  return null;
}

export function extractPayloadFromBatchExecuteResponse(
  responseText: string,
  rpcId: string,
): string | null {
  const lines = responseText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === ")]}'") {
      continue;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const payload = findRpcPayload(parsed, rpcId);
      if (payload) {
        return payload;
      }
    } catch {
      // Ignore non-JSON lines.
    }
  }

  return null;
}

function normalizeText(content: string): string {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
}

function isLikelyMessageText(content: string): boolean {
  const text = normalizeText(content);
  if (!text) {
    return false;
  }

  if (text.startsWith("http://") || text.startsWith("https://")) {
    return false;
  }

  if (text.includes("googleusercontent.com/image_generation_content/")) {
    return false;
  }

  if (/^(?:rc_|r_|c_)[a-zA-Z0-9_]+$/.test(text)) {
    return false;
  }

  if (/^[A-Za-z0-9+/=_-]{48,}$/.test(text)) {
    return false;
  }

  return /[A-Za-z0-9\u4e00-\u9fff]/.test(text);
}

function findFirstString(node: unknown): string | null {
  const stack: unknown[] = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    if (typeof current === "string") {
      if (isLikelyMessageText(current)) {
        return normalizeText(current);
      }
      continue;
    }

    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i -= 1) {
        stack.push(current[i]);
      }
      continue;
    }

    if (current && typeof current === "object") {
      const values = Object.values(current as Record<string, unknown>);
      for (let i = values.length - 1; i >= 0; i -= 1) {
        stack.push(values[i]);
      }
    }
  }

  return null;
}

function tryExtractUserMessage(node: unknown[]): string | null {
  if (
    node.length < 4 ||
    node[1] !== 1 ||
    node[2] !== null ||
    node[3] !== 0 ||
    !Array.isArray(node[0])
  ) {
    return null;
  }

  const content = findFirstString(node[0]);
  return content && isLikelyMessageText(content)
    ? normalizeText(content)
    : null;
}

function tryExtractAssistantMessage(node: unknown[]): string | null {
  const messageId = node[0];
  if (typeof messageId !== "string" || !/^rc_[a-zA-Z0-9]+$/.test(messageId)) {
    return null;
  }

  const content = findFirstString(node[1]);
  return content && isLikelyMessageText(content)
    ? normalizeText(content)
    : null;
}

function dedupeMessages(messages: RawMessage[]): RawMessage[] {
  const deduped: RawMessage[] = [];

  for (const message of messages) {
    const content = normalizeText(message.content);
    if (!content) {
      continue;
    }

    const previous = deduped[deduped.length - 1];
    if (previous?.role === message.role && previous.content === content) {
      continue;
    }

    deduped.push({
      role: message.role,
      content,
    });
  }

  return deduped;
}

export function extractMessagesFromPayload(payload: unknown): RawMessage[] {
  const collected: RawMessage[] = [];
  const stack: unknown[] = [payload];

  while (stack.length > 0) {
    const node = stack.pop();
    if (!Array.isArray(node)) {
      continue;
    }

    const userText = tryExtractUserMessage(node);
    if (userText) {
      collected.push({ role: "user", content: userText });
    }

    const assistantText = tryExtractAssistantMessage(node);
    if (assistantText) {
      collected.push({ role: "assistant", content: assistantText });
    }

    for (let i = node.length - 1; i >= 0; i -= 1) {
      stack.push(node[i]);
    }
  }

  return dedupeMessages(collected);
}
