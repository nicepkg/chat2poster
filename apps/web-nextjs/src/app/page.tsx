"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ImportPage() {
  const router = useRouter();
  const [shareLink, setShareLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!shareLink.trim()) {
      setError("Please enter a share link");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/parse-share-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shareLink.trim() }),
      });

      const data = (await response.json()) as {
        success: boolean;
        conversation?: unknown;
        error?: { code: string; message: string };
      };

      if (!data.success) {
        setError(data.error?.message ?? "Failed to parse share link");
        return;
      }

      // Store conversation and navigate to editor
      if (data.conversation) {
        sessionStorage.setItem(
          "chat2poster:conversation",
          JSON.stringify(data.conversation),
        );
        router.push("/editor");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Chat2Poster</h1>
          <p className="mt-2 text-gray-600">
            Turn AI chats into share-worthy posters
          </p>
        </div>

        {/* Import Card */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Import from Share Link
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="shareLink"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                ChatGPT / Claude / Gemini Share Link
              </label>
              <input
                id="shareLink"
                type="url"
                value={shareLink}
                onChange={(e) => setShareLink(e.target.value)}
                placeholder="https://chatgpt.com/share/... or claude.ai/share/..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleParse}
              disabled={isLoading}
              className="w-full rounded-lg bg-primary-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Parsing...
                </span>
              ) : (
                "Parse & Continue"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Alternative Options */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/manual"
              className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <svg
                className="mb-2 h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Manual Builder
              </span>
              <span className="mt-0.5 text-xs text-gray-500">
                Create from scratch
              </span>
            </Link>

            <Link
              href="/paste"
              className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <svg
                className="mb-2 h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Paste Text
              </span>
              <span className="mt-0.5 text-xs text-gray-500">
                Import from clipboard
              </span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Your conversations are processed locally. We never store your data.
        </p>
      </div>
    </main>
  );
}
