"use client";

import {
  Button,
  Card,
  CardContent,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
  useI18n,
} from "@chat2poster/shared-ui";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical,
  User,
  Bot,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface MessageInput {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ManualBuilderPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageInput[]>([
    { id: crypto.randomUUID(), role: "user", content: "" },
    { id: crypto.randomUUID(), role: "assistant", content: "" },
  ]);
  const validCount = messages.filter((m) => m.content.trim()).length;
  const roleUser = t("web.manual.roleUser");
  const roleAssistant = t("web.manual.roleAssistant");
  const messageCount = t("web.manual.messageCount", {
    count: validCount,
    suffix: validCount === 1 ? "" : "s",
  });

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
      return;
    }

    sessionStorage.setItem(
      "chat2poster:manual-messages",
      JSON.stringify(validMessages),
    );
    router.push(`/${locale}/editor`);
  };

  return (
    <main className="bg-background relative min-h-screen">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -right-40 top-20 h-80 w-80 rounded-full blur-[100px]" />
        <div className="bg-secondary/5 absolute -left-40 bottom-20 h-80 w-80 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={`/${locale}/import`}
            className="text-muted-foreground hover:text-foreground group mb-4 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("web.manual.back")}
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-foreground text-3xl font-bold tracking-tight">
                {t("web.manual.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("web.manual.subtitle")}
              </p>
            </div>
            <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              {messageCount}
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <Reorder.Group
          axis="y"
          values={messages}
          onReorder={setMessages}
          className="space-y-4"
        >
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <Reorder.Item
                key={message.id}
                value={message}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                whileDrag={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px oklch(0.2 0.02 260 / 0.12)",
                  cursor: "grabbing",
                }}
              >
                <Card
                  className={cn(
                    "group border-border/50 bg-card/80 relative overflow-hidden backdrop-blur-sm transition-all duration-200",
                    "hover:border-border hover:shadow-md",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="text-muted-foreground/50 h-5 w-5" />
                        </motion.div>
                        <div className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium">
                          #{index + 1}
                        </div>
                        <Select
                          value={message.role}
                          onValueChange={(value: "user" | "assistant") =>
                            updateMessage(message.id, "role", value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[130px] text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <span className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                {roleUser}
                              </span>
                            </SelectItem>
                            <SelectItem value="assistant">
                              <span className="flex items-center gap-2">
                                <Bot className="h-3.5 w-3.5" />
                                {roleAssistant}
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {messages.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeMessage(message.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                    <Textarea
                      value={message.content}
                      onChange={(e) =>
                        updateMessage(message.id, "content", e.target.value)
                      }
                      placeholder={t("web.manual.placeholder", {
                        role:
                          message.role === "user" ? roleUser : roleAssistant,
                      })}
                      className="min-h-[100px] resize-none text-sm transition-all duration-200 focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                    {/* Role indicator bar */}
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 w-1 transition-colors",
                        message.role === "user" ? "bg-primary" : "bg-secondary",
                      )}
                    />
                  </CardContent>
                </Card>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Add Message Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={addMessage}
            className="group mt-4 h-12 w-full border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
            {t("web.manual.addMessage")}
          </Button>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-between"
        >
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            <span>{t("web.manual.tip")}</span>
          </div>
          <Button
            onClick={handleContinue}
            disabled={validCount === 0}
            className="group h-11 px-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t("web.manual.continue")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
