"use client";

import { Button, Card, CardContent, Textarea } from "@chat2poster/shared-ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  ClipboardPaste,
  FileText,
  Lightbulb,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formatExamples = [
  { prefix: "User:", desc: "User message", template: "User: " },
  { prefix: "Assistant:", desc: "AI response", template: "Assistant: " },
  { prefix: "Human:", desc: "Alternative user", template: "Human: " },
  { prefix: "AI:", desc: "Alternative AI", template: "AI: " },
];

export default function PasteImportPage() {
  const router = useRouter();
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasteEffect, setShowPasteEffect] = useState(false);

  const insertFormat = (template: string) => {
    setPastedText((prev) => {
      const newValue = prev ? `${prev}\n\n${template}` : template;
      return newValue;
    });
  };

  const handlePaste = () => {
    setShowPasteEffect(true);
    setTimeout(() => setShowPasteEffect(false), 500);
  };

  const handleParse = async () => {
    if (!pastedText.trim()) {
      setError("Please paste some text");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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
        const userMatch = /^(User|Human|Me|You):\s*/i.exec(trimmedLine);
        const assistantMatch =
          /^(Assistant|AI|ChatGPT|Claude|Gemini|Bot):\s*/i.exec(trimmedLine);

        if (userMatch) {
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

      if (currentContent.length > 0) {
        messages.push({
          id: crypto.randomUUID(),
          role: currentRole,
          content: currentContent.join("\n").trim(),
        });
      }

      if (messages.length === 0) {
        messages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: pastedText.trim(),
        });
      }

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

  const charCount = pastedText.length;
  const lineCount = pastedText.split("\n").filter((l) => l.trim()).length;

  return (
    <main className="bg-background relative min-h-screen">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-secondary/5 absolute -left-40 top-20 h-80 w-80 rounded-full blur-[100px]" />
        <div className="bg-primary/5 absolute -right-40 bottom-20 h-80 w-80 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground group mb-4 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Import
          </Link>
          <div className="flex items-start gap-4">
            <div className="bg-secondary/10 rounded-xl p-3">
              <ClipboardPaste className="text-secondary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-foreground text-3xl font-bold tracking-tight">
                Paste Import
              </h1>
              <p className="text-muted-foreground mt-2">
                Paste your conversation text and we&apos;ll detect the format
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 overflow-hidden backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Textarea */}
              <div className="relative">
                <motion.div
                  animate={
                    showPasteEffect
                      ? {
                          boxShadow: [
                            "0 0 0 0 oklch(0.619 0.202 268.7 / 0)",
                            "0 0 0 4px oklch(0.619 0.202 268.7 / 0.2)",
                            "0 0 0 0 oklch(0.619 0.202 268.7 / 0)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                  className="rounded-lg"
                >
                  <Textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={`User: Hello, can you help me?\n\nAssistant: Of course! What do you need help with?\n\nUser: I need to...\n\nAssistant: Sure, here's how...`}
                    className="min-h-[280px] resize-none font-mono text-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 focus:border-primary"
                  />
                </motion.div>
                {/* Stats badge */}
                <AnimatePresence>
                  {pastedText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-muted-foreground absolute right-3 bottom-3 flex items-center gap-3 text-xs"
                    >
                      <span>{charCount.toLocaleString()} chars</span>
                      <span className="bg-border h-3 w-px" />
                      <span>{lineCount} lines</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Format hints as clickable chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-muted/50 mt-4 rounded-xl p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="text-primary h-4 w-4" />
                  <span className="text-foreground text-sm font-medium">
                    Quick insert format
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formatExamples.map((fmt) => (
                    <motion.button
                      key={fmt.prefix}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => insertFormat(fmt.template)}
                      className="group flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-sm transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                    >
                      <code className="text-primary font-medium">
                        {fmt.prefix}
                      </code>
                      <span className="text-muted-foreground text-xs">
                        {fmt.desc}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <p className="text-muted-foreground mt-3 text-xs">
                  Click to insert format, or paste text with markers directly
                </p>
              </motion.div>

              {/* Error */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-destructive/10 text-destructive mt-4 flex items-center gap-2 rounded-lg p-3 text-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <Link href="/manual">
                  <Button
                    variant="outline"
                    className="group transition-all duration-200"
                  >
                    <PenLine className="mr-2 h-4 w-4" />
                    Use Manual Builder
                  </Button>
                </Link>
                <Button
                  onClick={handleParse}
                  disabled={isLoading || !pastedText.trim()}
                  className="group h-11 px-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Parsing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Parse & Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
