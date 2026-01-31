"use client";

import * as React from "react";
import { MessageSquare, Palette, Settings2 } from "lucide-react";
import { cn } from "~/utils/common";
import { useEditor, THEME_PRESETS } from "~/contexts/EditorContext";
import { useI18n } from "~/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MessagesTab } from "./MessagesTab";
import { ThemeTab } from "./ThemeTab";
import { ExportTab } from "./ExportTab";

export interface EditorTabsProps {
  /** Default active tab */
  defaultTab?: "messages" | "theme" | "export";
  /** Additional CSS classes */
  className?: string;
  /** Show icons in tab triggers */
  showIcons?: boolean;
  /** Show text labels in tab triggers */
  showLabels?: boolean;
}

/**
 * EditorTabs component that encapsulates MessagesTab, ThemeTab, and ExportTab.
 * Reads and writes state directly from EditorContext.
 */
export function EditorTabs({
  defaultTab = "messages",
  className,
  showIcons = true,
  showLabels = true,
}: EditorTabsProps) {
  const { t } = useI18n();
  const { editor, actions } = useEditor();

  const messages = editor.conversation?.messages ?? [];
  const selectedIds = editor.selection?.selectedMessageIds ?? [];
  const pageBreaks = editor.selection?.pageBreaks ?? [];
  const pageCount = pageBreaks.length + 1;

  return (
    <Tabs
      defaultValue={defaultTab}
      className={cn("flex h-full flex-col", className)}
    >
      <TabsList className="m-2 grid w-auto grid-cols-3">
        <TabsTrigger
          value="messages"
          className={cn("gap-1.5", showLabels ? "text-xs" : "")}
        >
          {showIcons && <MessageSquare className="h-3.5 w-3.5" />}
          {showLabels && (
            <span className="hidden sm:inline">{t("editor.tabs.messages")}</span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="theme"
          className={cn("gap-1.5", showLabels ? "text-xs" : "")}
        >
          {showIcons && <Palette className="h-3.5 w-3.5" />}
          {showLabels && (
            <span className="hidden sm:inline">{t("editor.tabs.theme")}</span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="export"
          className={cn("gap-1.5", showLabels ? "text-xs" : "")}
        >
          {showIcons && <Settings2 className="h-3.5 w-3.5" />}
          {showLabels && (
            <span className="hidden sm:inline">{t("editor.tabs.export")}</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="messages" className="mt-0 flex-1 overflow-hidden">
        <MessagesTab
          messages={messages}
          selectedIds={selectedIds}
          pageBreaks={pageBreaks}
          onToggle={actions.toggleMessage}
          onSelectAll={actions.selectAllMessages}
          onDeselectAll={actions.deselectAllMessages}
          onAddPageBreak={actions.addPageBreak}
          onRemovePageBreak={actions.removePageBreak}
        />
      </TabsContent>

      <TabsContent value="theme" className="mt-0 flex-1 overflow-auto">
        <ThemeTab
          selectedThemeId={editor.selectedTheme.id}
          decoration={editor.decoration}
          themes={THEME_PRESETS}
          onThemeChange={actions.setTheme}
          onDecorationChange={actions.setDecoration}
        />
      </TabsContent>

      <TabsContent value="export" className="mt-0 flex-1 overflow-auto">
        <ExportTab
          exportParams={editor.exportParams}
          autoPagination={editor.autoPagination}
          pageCount={pageCount}
          onParamsChange={actions.setExportParams}
          onAutoPaginationChange={actions.setAutoPagination}
        />
      </TabsContent>
    </Tabs>
  );
}
