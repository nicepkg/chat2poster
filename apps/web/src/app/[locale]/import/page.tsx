"use client";

import {
  Button,
  Card,
  CardContent,
  Input,
  cn,
  useI18n,
} from "@chat2poster/shared-ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Link2,
  PenLine,
  ClipboardPaste,
  Loader2,
  AlertCircle,
  Sparkles,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function ImportPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [shareLink, setShareLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = {
    badge: t("web.import.badge"),
    title: t("web.import.title"),
    subtitle: t("web.import.subtitle"),
    sectionTitle: t("web.import.sectionTitle"),
    sectionDesc: t("web.import.sectionDesc"),
    errorEmpty: t("web.import.errorEmpty"),
    errorParse: t("web.import.errorParse"),
    errorParseFallback: t("web.import.errorParseFallback"),
    parse: t("web.import.parse"),
    parsing: t("web.import.parsing"),
    or: t("web.import.or"),
    manualTitle: t("web.import.manualTitle"),
    manualDesc: t("web.import.manualDesc"),
    pasteTitle: t("web.import.pasteTitle"),
    pasteDesc: t("web.import.pasteDesc"),
    privacy: t("web.import.privacy"),
  };

  const handleParse = async () => {
    if (!shareLink.trim()) {
      setError(copy.errorEmpty);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/${locale}/api/parse-share-link`, {
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
        setError(data.error?.message ?? copy.errorParse);
        return;
      }

      if (data.conversation) {
        sessionStorage.setItem(
          "chat2poster:conversation",
          JSON.stringify(data.conversation),
        );
        router.push(`/${locale}/editor`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorParseFallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden p-4">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -left-40 -top-40 h-80 w-80 rounded-full blur-[100px]" />
        <div className="bg-secondary/5 absolute -bottom-40 -right-40 h-80 w-80 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            {copy.badge}
          </motion.div>
          <h1 className="from-foreground to-foreground/70 bg-gradient-to-b bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            {copy.title}
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">{copy.subtitle}</p>
        </div>

        {/* Main Card */}
        <Card className="border-border/50 bg-card/80 overflow-hidden backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 rounded-xl p-3">
                <Link2 className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold">
                  {copy.sectionTitle}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {copy.sectionDesc}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="url"
                  value={shareLink}
                  onChange={(e) => setShareLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleParse()}
                  placeholder="https://chatgpt.com/share/..."
                  className="h-12 pr-4 pl-4 text-base"
                />
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleParse}
                disabled={isLoading}
                className="group h-12 w-full text-base font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.parsing}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {copy.parse}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-sm">{copy.or}</span>
              <div className="bg-border h-px flex-1" />
            </div>

            {/* Alternative Options */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3"
            >
              <motion.div variants={itemVariants}>
                <Link href={`/${locale}/manual`} className="group block">
                  <motion.div
                    whileHover={{
                      y: -3,
                      boxShadow:
                        "0 10px 20px oklch(0.619 0.202 268.7 / 0.08), 0 4px 8px oklch(0.2 0.02 260 / 0.04)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex flex-col items-center rounded-xl border-2 border-transparent p-4 text-center",
                      "bg-muted/50 transition-all duration-300",
                      "hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent",
                    )}
                  >
                    <div className="bg-background mb-3 rounded-lg p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/10">
                      <PenLine className="text-primary h-5 w-5" />
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {copy.manualTitle}
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-xs">
                      {copy.manualDesc}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link href={`/${locale}/paste`} className="group block">
                  <motion.div
                    whileHover={{
                      y: -3,
                      boxShadow:
                        "0 10px 20px oklch(0.619 0.202 268.7 / 0.08), 0 4px 8px oklch(0.2 0.02 260 / 0.04)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex flex-col items-center rounded-xl border-2 border-transparent p-4 text-center",
                      "bg-muted/50 transition-all duration-300",
                      "hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent",
                    )}
                  >
                    <div className="bg-background mb-3 rounded-lg p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/10">
                      <ClipboardPaste className="text-primary h-5 w-5" />
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {copy.pasteTitle}
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-xs">
                      {copy.pasteDesc}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-center text-sm"
        >
          <Shield className="h-4 w-4" />
          <span>{copy.privacy}</span>
        </motion.div>
      </motion.div>
    </main>
  );
}
