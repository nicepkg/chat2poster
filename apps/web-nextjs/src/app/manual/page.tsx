"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface MessageInput {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ManualBuilderPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageInput[]>([
    { id: crypto.randomUUID(), role: "user", content: "" },
    { id: crypto.randomUUID(), role: "assistant", content: "" },
  ]);

  const addMessage = useCallback(() => {
    const lastRole = messages[messages.length - 1]?.role ?? "assistant";
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: lastRole === "user" ? "assistant" : "user",
        content: "",
      },
    ]);
  }, [messages]);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMessage = useCallback(
    (id: string, field: "role" | "content", value: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
      );
    },
    [],
  );

  const handleContinue = () => {
    const validMessages = messages.filter((m) => m.content.trim());
    if (validMessages.length === 0) {
      alert("Please add at least one message");
      return;
    }

    // Store in sessionStorage and navigate to editor
    sessionStorage.setItem(
      "chat2poster:manual-messages",
      JSON.stringify(validMessages),
    );
    router.push("/editor");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Import
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Manual Builder
            </h1>
            <p className="text-sm text-gray-600">
              Create a conversation from scratch
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    #{index + 1}
                  </span>
                  <select
                    value={message.role}
                    onChange={(e) =>
                      updateMessage(
                        message.id,
                        "role",
                        e.target.value as "user" | "assistant",
                      )
                    }
                    className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="assistant">Assistant</option>
                  </select>
                </div>
                {messages.length > 1 && (
                  <button
                    onClick={() => removeMessage(message.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                    title="Remove message"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <textarea
                value={message.content}
                onChange={(e) =>
                  updateMessage(message.id, "content", e.target.value)
                }
                placeholder={`Enter ${message.role} message (supports Markdown)`}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          ))}
        </div>

        {/* Add Message Button */}
        <button
          onClick={addMessage}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-600"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Message
        </button>

        {/* Continue Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleContinue}
            className="rounded-lg bg-primary-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-600"
          >
            Continue to Editor
          </button>
        </div>
      </div>
    </main>
  );
}
