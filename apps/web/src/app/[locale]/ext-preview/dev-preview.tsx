"use client";

import {
  createConversation,
  createMessage,
  type Conversation,
  type MessageRole,
} from "@chat2poster/core-schema";
import {
  Badge,
  EditorDataProvider,
  EditorModal,
  EditorProvider,
  FloatingButton,
  generateUUID,
  useConversationExport,
  useI18n,
} from "@chat2poster/shared-ui";
import { useCallback, useMemo, useRef, useState } from "react";

const SAMPLE_MESSAGES: Array<{ role: MessageRole; content: string }> = [
  {
    role: "user",
    content: "帮我把这段对话做成海报，风格要简洁但有质感。顺便加一点渐变背景。",
  },
  {
    role: "assistant",
    content:
      "好的，我会为你生成一个简洁、带有柔和渐变的海报布局。接下来我会：\n\n- 统一气泡样式\n- 调整字体层级\n- 保持足够留白\n\n你希望输出比例是 1:1 还是 16:9？",
  },
  {
    role: "user",
    content: "16:9。顺便给我一个导出流程说明，最好带代码示例。",
  },
  {
    role: "assistant",
    content:
      '当然可以。下面是简化的导出流程示例：\n\n```ts\nconst result = await exportToPng(canvas, { scale: 2 });\nawait downloadImage(result.blob, "chat2poster.png");\n```\n\n如果你需要多页导出，我也可以帮你加 ZIP 打包。',
  },
  {
    role: "assistant",
    content: "另外，我会把主题预设调成 Ocean，这样背景更有层次感。",
  },
];

function buildFakeConversation(): Conversation {
  const messages = SAMPLE_MESSAGES.map((message, index) =>
    createMessage({
      id: generateUUID(),
      role: message.role,
      contentMarkdown: message.content,
      order: index,
      contentMeta: {
        containsCodeBlock: message.content.includes("```"),
        containsImage: message.content.includes("!["),
      },
    }),
  );

  return createConversation({
    id: generateUUID(),
    sourceType: "web-manual",
    messages,
    sourceMeta: {
      provider: "chatgpt",
    },
  });
}

export default function DevPreview() {
  const [open, setOpen] = useState(false);
  const conversation = useMemo(() => buildFakeConversation(), []);

  return (
    <EditorProvider>
      <DevPreviewShell
        conversation={conversation}
        open={open}
        onOpenChange={setOpen}
      />
    </EditorProvider>
  );
}

function DevPreviewShell({
  conversation,
  open,
  onOpenChange,
}: {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { exportConversation } = useConversationExport({
    canvasRef,
    filenamePrefix: "chat2poster",
  });

  const handleParseConversation = useCallback(
    async () => conversation,
    [conversation],
  );

  return (
    <EditorDataProvider
      parseConversation={handleParseConversation}
      exportConversation={exportConversation}
    >
      <div className="bg-muted/30 min-h-[calc(100vh-64px)]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{t("web.extPreview.devOnly")}</Badge>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("web.extPreview.title")}
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              {t("web.extPreview.subtitle")}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-background/80 p-6 shadow-lg backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative space-y-4">
              <div className="flex justify-end">
                <div className="bg-primary/10 text-primary max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed">
                  这里是聊天区域的占位内容，用来模拟扩展浮窗出现时的视觉层级。
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted/70 text-foreground max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed">
                  点击右下角浮动按钮，就能打开居中弹窗的核心面板。
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary/10 text-primary max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed">
                  模态层使用真实的 Editor 面板，数据来自 Context。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingButton onClick={() => onOpenChange(true)} visible={!open} />
      <EditorModal
        open={open}
        onOpenChange={onOpenChange}
        canvasRef={canvasRef}
      />
    </EditorDataProvider>
  );
}
