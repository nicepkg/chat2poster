"use client";

import { useEditor } from "@ui/contexts/editor-context";
import type { ExportScope } from "@ui/contexts/editor-data-context";
import { useIsMobile } from "@ui/hooks";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";
import { type RefObject } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { EditorPreview } from "./editor-preview";
import { EditorTabs } from "./editor-tabs";

export interface EditorWorkspaceProps {
  canvasRef?: RefObject<HTMLDivElement | null>;
  onExport?: (scope?: ExportScope) => Promise<void>;
  className?: string;
  containerClassName?: string;
  settingsTitle?: string;
  showMobileDrawer?: boolean;
  mountedTo?: Element | DocumentFragment | null | undefined;
}

export function EditorWorkspace({
  canvasRef,
  onExport,
  className,
  containerClassName,
  settingsTitle,
  showMobileDrawer = true,
  mountedTo,
}: EditorWorkspaceProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const { editor } = useEditor();

  const selectedCount = editor.selection?.selectedMessageIds.length ?? 0;

  const drawerTitle = settingsTitle ?? t("web.editor.settings");

  const showDrawer = showMobileDrawer && isMobile;

  return (
    <div className={cn("bg-muted/30", className)}>
      <div className={cn("mx-auto flex w-full gap-4 p-4", containerClassName)}>
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-80 shrink-0"
          >
            <Card className="bg-card/80 h-full overflow-hidden backdrop-blur-sm py-0">
              <EditorTabs defaultTab="theme" />
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="min-h-0 flex-1 overflow-hidden"
        >
          {showDrawer ? (
            <Drawer direction="left">
              <EditorPreview
                canvasRef={canvasRef}
                onExport={onExport}
                exportDisabled={selectedCount === 0}
                className="h-full"
                headerLeftAddon={
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 rounded-full shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
                      title={drawerTitle}
                      aria-label={drawerTitle}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </DrawerTrigger>
                }
              />
              <DrawerContent mountedTo={mountedTo}>
                <DrawerHeader className="border-b">
                  <DrawerTitle>{drawerTitle}</DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto">
                  <EditorTabs defaultTab="theme" />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <EditorPreview
              canvasRef={canvasRef}
              onExport={onExport}
              exportDisabled={selectedCount === 0}
              className="h-full"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
