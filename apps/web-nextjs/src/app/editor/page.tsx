"use client";

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Label,
  Slider,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  cn,
} from "@chat2poster/shared-ui";
import { MarkdownRenderer } from "@chat2poster/shared-ui/components/renderer";
import "@chat2poster/shared-ui/styles/renderer.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  MessageSquare,
  Palette,
  Settings2,
  Check,
  Scissors,
  X,
  User,
  Bot,
  Sparkles,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Selection {
  selectedIds: string[];
  pageBreaks: { id: string; afterMessageId: string }[];
}

interface Decoration {
  canvasPaddingPx: number;
  canvasRadiusPx: number;
  shadowLevel: "none" | "sm" | "md" | "lg" | "xl";
  backgroundValue: string;
  macosBarEnabled: boolean;
}

interface ExportParams {
  scale: 1 | 2 | 3;
  canvasWidthPx: number;
  maxPageHeightPx: number;
}

const defaultDecoration: Decoration = {
  canvasPaddingPx: 24,
  canvasRadiusPx: 16,
  shadowLevel: "lg",
  backgroundValue: "#ffffff",
  macosBarEnabled: true,
};

const defaultExportParams: ExportParams = {
  scale: 2,
  canvasWidthPx: 800,
  maxPageHeightPx: 4096,
};

const shadowStyles = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const backgroundPresets = [
  { value: "#ffffff", label: "White", color: "#ffffff" },
  { value: "#f8fafc", label: "Slate", color: "#f8fafc" },
  { value: "#fef3c7", label: "Amber", color: "#fef3c7" },
  { value: "#dbeafe", label: "Blue", color: "#dbeafe" },
  { value: "#dcfce7", label: "Green", color: "#dcfce7" },
  { value: "#fae8ff", label: "Fuchsia", color: "#fae8ff" },
  { value: "#1e1e2e", label: "Dark", color: "#1e1e2e" },
  {
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    label: "Indigo",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
];

export default function EditorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selection, setSelection] = useState<Selection>({
    selectedIds: [],
    pageBreaks: [],
  });
  const [decoration, setDecoration] = useState<Decoration>(defaultDecoration);
  const [exportParams, setExportParams] =
    useState<ExportParams>(defaultExportParams);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conversationData = sessionStorage.getItem("chat2poster:conversation");
    if (conversationData) {
      try {
        const conversation = JSON.parse(conversationData) as {
          messages: Array<{
            id: string;
            role: "user" | "assistant";
            contentMarkdown: string;
          }>;
        };
        const msgs: Message[] = conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.contentMarkdown,
        }));
        setMessages(msgs);
        setSelection({
          selectedIds: msgs.map((m) => m.id),
          pageBreaks: [],
        });
        return;
      } catch {
        // Continue to try other storage
      }
    }

    const manualData = sessionStorage.getItem("chat2poster:manual-messages");
    if (manualData) {
      try {
        const parsed = JSON.parse(manualData) as Message[];
        setMessages(parsed);
        setSelection({
          selectedIds: parsed.map((m) => m.id),
          pageBreaks: [],
        });
        return;
      } catch {
        // Fall through to redirect
      }
    }

    router.push("/");
  }, [router]);

  const toggleMessage = useCallback((id: string) => {
    setSelection((prev) => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter((i) => i !== id)
        : [...prev.selectedIds, id],
    }));
  }, []);

  const selectAll = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      selectedIds: messages.map((m) => m.id),
    }));
  }, [messages]);

  const deselectAll = useCallback(() => {
    setSelection((prev) => ({ ...prev, selectedIds: [] }));
  }, []);

  const addPageBreak = useCallback((afterMessageId: string) => {
    setSelection((prev) => ({
      ...prev,
      pageBreaks: [
        ...prev.pageBreaks,
        { id: crypto.randomUUID(), afterMessageId },
      ],
    }));
  }, []);

  const removePageBreak = useCallback((id: string) => {
    setSelection((prev) => ({
      ...prev,
      pageBreaks: prev.pageBreaks.filter((pb) => pb.id !== id),
    }));
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual export with core-export
      await new Promise((r) => setTimeout(r, 1500));
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const pageCount = selection.pageBreaks.length + 1;
  const selectedMessages = messages.filter((m) =>
    selection.selectedIds.includes(m.id),
  );

  if (messages.length === 0) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground text-sm">Loading...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="bg-muted/30 flex min-h-screen flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-lg"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground group flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="bg-border h-6 w-px" />
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              <h1 className="text-foreground text-lg font-semibold">Editor</h1>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={selection.selectedIds.length === 0 || isExporting}
            className="group h-10 px-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <AnimatePresence mode="wait">
              {isExporting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </motion.span>
              ) : exportSuccess ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-500"
                >
                  <Check className="h-4 w-4" />
                  Done!
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {pageCount > 1 ? `Export ${pageCount} Pages` : "Export PNG"}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-4 lg:p-6">
        {/* Left Panel - Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-80 shrink-0"
        >
          <Card className="bg-card/80 sticky top-24 overflow-hidden backdrop-blur-sm">
            <Tabs
              defaultValue="messages"
              className="flex h-[calc(100vh-140px)] flex-col"
            >
              <TabsList className="m-2 grid w-auto grid-cols-3">
                <TabsTrigger value="messages" className="gap-1.5 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="theme" className="gap-1.5 text-xs">
                  <Palette className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Theme</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="gap-1.5 text-xs">
                  <Settings2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </TabsTrigger>
              </TabsList>

              {/* Messages Tab */}
              <TabsContent
                value="messages"
                className="mt-0 flex-1 overflow-hidden"
              >
                <div className="flex h-full flex-col">
                  <div className="border-b px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {selection.selectedIds.length}/{messages.length}{" "}
                        selected
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={selectAll}
                          className="text-primary h-7 px-2 text-xs"
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={deselectAll}
                          className="h-7 px-2 text-xs"
                        >
                          None
                        </Button>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 px-2 py-2">
                    <div className="space-y-1.5">
                      {messages.map((msg, idx) => {
                        const pb = selection.pageBreaks.find(
                          (p) => p.afterMessageId === msg.id,
                        );
                        const isSelected = selection.selectedIds.includes(
                          msg.id,
                        );
                        return (
                          <div key={msg.id}>
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <label
                                className={cn(
                                  "group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-200",
                                  isSelected
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-transparent hover:border-border hover:bg-muted/50",
                                )}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleMessage(msg.id)}
                                  className="mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    {msg.role === "user" ? (
                                      <User className="text-primary h-3.5 w-3.5" />
                                    ) : (
                                      <Bot className="text-secondary h-3.5 w-3.5" />
                                    )}
                                    <span
                                      className={cn(
                                        "text-xs font-medium",
                                        msg.role === "user"
                                          ? "text-primary"
                                          : "text-secondary",
                                      )}
                                    >
                                      {msg.role}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground line-clamp-2 text-xs">
                                    {msg.content}
                                  </p>
                                </div>
                                {idx < messages.length - 1 && !pb && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      addPageBreak(msg.id);
                                    }}
                                    className="text-muted-foreground hover:text-primary h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    <Scissors className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </label>
                            </motion.div>
                            <AnimatePresence>
                              {pb && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex items-center gap-2 px-3 py-2"
                                >
                                  <div className="bg-secondary/30 h-px flex-1" />
                                  <span className="text-secondary flex items-center gap-1 text-xs font-medium">
                                    <Scissors className="h-3 w-3" />
                                    Page break
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => removePageBreak(pb.id)}
                                    className="text-muted-foreground hover:text-destructive h-5 w-5"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <div className="bg-secondary/30 h-px flex-1" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Theme Tab */}
              <TabsContent value="theme" className="mt-0 flex-1 overflow-auto">
                <div className="space-y-6 p-4">
                  {/* Background */}
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Background
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {backgroundPresets.map((preset) => (
                        <motion.button
                          key={preset.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setDecoration((d) => ({
                              ...d,
                              backgroundValue: preset.value,
                            }))
                          }
                          className={cn(
                            "relative aspect-square rounded-lg border-2 transition-all",
                            decoration.backgroundValue === preset.value
                              ? "border-primary ring-primary/20 ring-2"
                              : "border-transparent hover:border-border",
                          )}
                          style={{
                            background: preset.color,
                          }}
                        >
                          {decoration.backgroundValue === preset.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-primary absolute inset-0 flex items-center justify-center rounded-md bg-opacity-20"
                            >
                              <Check className="h-4 w-4 text-white drop-shadow" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                        Border Radius
                      </Label>
                      <span className="text-muted-foreground text-xs">
                        {decoration.canvasRadiusPx}px
                      </span>
                    </div>
                    <Slider
                      value={[decoration.canvasRadiusPx]}
                      min={0}
                      max={32}
                      step={2}
                      onValueChange={(values) =>
                        setDecoration((d) => ({
                          ...d,
                          canvasRadiusPx: values[0] ?? d.canvasRadiusPx,
                        }))
                      }
                    />
                  </div>

                  {/* Padding */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                        Padding
                      </Label>
                      <span className="text-muted-foreground text-xs">
                        {decoration.canvasPaddingPx}px
                      </span>
                    </div>
                    <Slider
                      value={[decoration.canvasPaddingPx]}
                      min={0}
                      max={64}
                      step={4}
                      onValueChange={(values) =>
                        setDecoration((d) => ({
                          ...d,
                          canvasPaddingPx: values[0] ?? d.canvasPaddingPx,
                        }))
                      }
                    />
                  </div>

                  {/* Shadow */}
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Shadow
                    </Label>
                    <Select
                      value={decoration.shadowLevel}
                      onValueChange={(value: Decoration["shadowLevel"]) =>
                        setDecoration((d) => ({
                          ...d,
                          shadowLevel: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* macOS Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="text-muted-foreground h-4 w-4" />
                      <Label className="text-sm">macOS Bar</Label>
                    </div>
                    <Switch
                      checked={decoration.macosBarEnabled}
                      onCheckedChange={(checked) =>
                        setDecoration((d) => ({
                          ...d,
                          macosBarEnabled: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export" className="mt-0 flex-1 overflow-auto">
                <div className="space-y-6 p-4">
                  {/* Scale */}
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Scale
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([1, 2, 3] as const).map((s) => (
                        <Button
                          key={s}
                          variant={
                            exportParams.scale === s ? "default" : "outline"
                          }
                          onClick={() =>
                            setExportParams((p) => ({ ...p, scale: s }))
                          }
                          className="h-10"
                        >
                          {s}x
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas Width */}
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Canvas Width
                    </Label>
                    <Select
                      value={String(exportParams.canvasWidthPx)}
                      onValueChange={(value) =>
                        setExportParams((p) => ({
                          ...p,
                          canvasWidthPx: Number(value),
                        }))
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="600">600px</SelectItem>
                        <SelectItem value="800">800px (Recommended)</SelectItem>
                        <SelectItem value="1080">1080px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Page Height */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                        Max Page Height
                      </Label>
                      <span className="text-muted-foreground text-xs">
                        {exportParams.maxPageHeightPx}px
                      </span>
                    </div>
                    <Slider
                      value={[exportParams.maxPageHeightPx]}
                      min={2000}
                      max={8000}
                      step={500}
                      onValueChange={(values) =>
                        setExportParams((p) => ({
                          ...p,
                          maxPageHeightPx: values[0] ?? p.maxPageHeightPx,
                        }))
                      }
                    />
                  </div>

                  {/* Info */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">
                      {pageCount > 1
                        ? `Your export will be split into ${pageCount} pages and downloaded as a ZIP file.`
                        : "Your export will be a single PNG image."}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Right Panel - Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-hidden"
        >
          <Card className="bg-card/50 h-full overflow-hidden">
            <CardContent className="flex h-full flex-col p-0">
              <div className="border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    Preview
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {exportParams.canvasWidthPx}px × auto
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-8 dark:bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%),linear-gradient(-45deg,#1a1a1a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1a1a1a_75%),linear-gradient(-45deg,transparent_75%,#1a1a1a_75%)]">
                <motion.div
                  ref={previewRef}
                  layout
                  className="mx-auto"
                  style={{
                    maxWidth: exportParams.canvasWidthPx,
                    borderRadius: decoration.canvasRadiusPx,
                    padding: decoration.canvasPaddingPx,
                    background: decoration.backgroundValue,
                    boxShadow: shadowStyles[decoration.shadowLevel],
                  }}
                >
                  {/* macOS Bar */}
                  <AnimatePresence>
                    {decoration.macosBarEnabled && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 flex gap-2"
                      >
                        <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Messages */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {selectedMessages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "rounded-xl p-4",
                            decoration.backgroundValue.startsWith("linear") ||
                              decoration.backgroundValue === "#1e1e2e"
                              ? msg.role === "user"
                                ? "bg-white/10 text-white"
                                : "bg-white/5 text-white/90"
                              : msg.role === "user"
                                ? "bg-primary/10 text-foreground"
                                : "bg-muted/50 text-foreground",
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {msg.role === "user" ? (
                              <User className="h-3.5 w-3.5 opacity-60" />
                            ) : (
                              <Bot className="h-3.5 w-3.5 opacity-60" />
                            )}
                            <span className="text-xs font-medium uppercase tracking-wide opacity-60">
                              {msg.role}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {selectedMessages.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <MessageSquare className="text-muted-foreground/30 mb-4 h-12 w-12" />
                        <p className="text-muted-foreground text-sm">
                          Select messages to preview
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
