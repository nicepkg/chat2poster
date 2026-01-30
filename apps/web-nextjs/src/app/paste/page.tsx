"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PasteImportPage() {
  const router = useRouter();
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!pastedText.trim()) {
      setError("Please paste some text");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simple parsing: split by common patterns
      const lines = pastedText.split("\n");
      const messages: {
        id: string;
        role: "user" | "assistant";
        content: string;
      }[] = [];

      let currentRole: "user" | "assistant" = "user";
      let currentContent: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Detect role markers
        const userMatch = /^(User|Human|Me|You):\s*/i.exec(trimmedLine);
        const assistantMatch =
          /^(Assistant|AI|ChatGPT|Claude|Gemini|Bot):\s*/i.exec(trimmedLine);

        if (userMatch) {
          // Save previous message if exists
          if (currentContent.length > 0) {
            messages.push({
              id: crypto.randomUUID(),
              role: currentRole,
              content: currentContent.join("\n").trim(),
            });
            currentContent = [];
          }
          currentRole = "user";
          const content = trimmedLine.slice(userMatch[0].length);
          if (content) currentContent.push(content);
        } else if (assistantMatch) {
          // Save previous message if exists
          if (currentContent.length > 0) {
            messages.push({
              id: crypto.randomUUID(),
              role: currentRole,
              content: currentContent.join("\n").trim(),
            });
            currentContent = [];
          }
          currentRole = "assistant";
          const content = trimmedLine.slice(assistantMatch[0].length);
          if (content) currentContent.push(content);
        } else if (trimmedLine) {
          currentContent.push(line);
        }
      }

      // Don't forget the last message
      if (currentContent.length > 0) {
        messages.push({
          id: crypto.randomUUID(),
          role: currentRole,
          content: currentContent.join("\n").trim(),
        });
      }

      if (messages.length === 0) {
        // Treat entire text as single assistant message
        messages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: pastedText.trim(),
        });
      }

      // Store and navigate
      sessionStorage.setItem(
        "chat2poster:manual-messages",
        JSON.stringify(messages),
      );
      router.push("/editor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse text");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Import
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Paste Import
          </h1>
          <p className="text-sm text-gray-600">
            Paste your conversation text and we&apos;ll try to detect the
            messages
          </p>
        </div>

        {/* Paste Area */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <label
            htmlFor="pastedText"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Paste your conversation
          </label>
          <textarea
            id="pastedText"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`User: Hello, can you help me?\n\nAssistant: Of course! What do you need help with?\n\n...`}
            rows={12}
            className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />

          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <h3 className="text-xs font-medium text-gray-700">
              Supported formats:
            </h3>
            <ul className="mt-1 list-inside list-disc text-xs text-gray-500">
              <li>
                Lines starting with &quot;User:&quot; or &quot;Human:&quot;
              </li>
              <li>
                Lines starting with &quot;Assistant:&quot;, &quot;AI:&quot;, or
                &quot;ChatGPT:&quot;
              </li>
              <li>Plain text (will be treated as single message)</li>
            </ul>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Link
              href="/manual"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Use Manual Builder
            </Link>
            <button
              onClick={handleParse}
              disabled={isLoading || !pastedText.trim()}
              className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoading ? "Parsing..." : "Parse & Continue"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
