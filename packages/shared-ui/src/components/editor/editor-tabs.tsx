"use client";

import { useEditor, THEME_PRESETS } from "@ui/contexts/editor-context";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import { MessageSquare, Palette, Settings2 } from "lucide-react";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ExportTab } from "./export-tab";
import { MessagesTab } from "./messages-tab";
import { ThemeTab } from "./theme-tab";

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
      className={cn("c2p-editor-tabs flex h-full flex-col", className)}
    >
      <TabsList className="c2p-tabs-list m-2 grid w-auto grid-cols-3">
        <TabsTrigger
          value="messages"
          className={cn(
            "c2p-tab-messages gap-1.5",
            showLabels ? "text-xs" : "",
          )}
        >
          {showIcons && <MessageSquare className="h-3.5 w-3.5" />}
          {showLabels && (
            <span className="hidden sm:inline">
              {t("editor.tabs.messages")}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="theme"
          className={cn("c2p-tab-theme gap-1.5", showLabels ? "text-xs" : "")}
        >
          {showIcons && <Palette className="h-3.5 w-3.5" />}
          {showLabels && (
            <span className="hidden sm:inline">{t("editor.tabs.theme")}</span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="export"
          className={cn("c2p-tab-export gap-1.5", showLabels ? "text-xs" : "")}
        >
          {showIcons && <Settings2 className="h-3.5 w-3.5" />}
          {showLabels && (
            <span className="hidden sm:inline">{t("editor.tabs.export")}</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="messages"
        className="c2p-tab-content-messages mt-0 min-h-0 flex-1"
      >
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

      <TabsContent
        value="theme"
        className="c2p-tab-content-theme mt-0 flex-1 overflow-auto"
      >
        <ThemeTab
          selectedThemeId={editor.selectedTheme.id}
          decoration={editor.decoration}
          themes={THEME_PRESETS}
          onThemeChange={actions.setTheme}
          onDecorationChange={actions.setDecoration}
        />
      </TabsContent>

      <TabsContent
        value="export"
        className="c2p-tab-content-export mt-0 flex-1 overflow-auto"
      >
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
