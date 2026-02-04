import {
  parseWithAdapters,
  registerBuiltinAdapters,
} from "@chat2poster/core-adapters";
import {
  EditorDataProvider,
  EditorModal,
  EditorProvider,
  FloatingButton,
  I18nProvider,
  useConversationExport,
} from "@chat2poster/shared-ui";
import { getLocaleFromNavigator } from "@chat2poster/shared-ui/i18n/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { getChat2posterBodyNode } from "../lib/utils";
import { EXTENSION_WINDOW_EVENT } from "~/constants/extension-runtime";

registerBuiltinAdapters();

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const locale =
    typeof navigator !== "undefined"
      ? getLocaleFromNavigator(
          navigator.languages.length > 0
            ? navigator.languages
            : navigator.language,
        )
      : "en";

  const handleOpenPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setIsPanelOpen((prev) => !prev);
    };
    const handleOpen = () => {
      setIsPanelOpen(true);
    };
    const handleClose = () => {
      setIsPanelOpen(false);
    };

    window.addEventListener(EXTENSION_WINDOW_EVENT.TOGGLE_PANEL, handleToggle);
    window.addEventListener(EXTENSION_WINDOW_EVENT.OPEN_PANEL, handleOpen);
    window.addEventListener(EXTENSION_WINDOW_EVENT.CLOSE_PANEL, handleClose);

    return () => {
      window.removeEventListener(
        EXTENSION_WINDOW_EVENT.TOGGLE_PANEL,
        handleToggle,
      );
      window.removeEventListener(EXTENSION_WINDOW_EVENT.OPEN_PANEL, handleOpen);
      window.removeEventListener(
        EXTENSION_WINDOW_EVENT.CLOSE_PANEL,
        handleClose,
      );
    };
  }, []);

  return (
    <I18nProvider locale={locale}>
      <EditorProvider>
        <ExtensionShell
          isPanelOpen={isPanelOpen}
          onOpenPanel={handleOpenPanel}
          onOpenChange={setIsPanelOpen}
        />
      </EditorProvider>
    </I18nProvider>
  );
}

function ExtensionShell({
  isPanelOpen,
  onOpenPanel,
  onOpenChange,
}: {
  isPanelOpen: boolean;
  onOpenPanel: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { exportConversation } = useConversationExport({ canvasRef });

  const handleParseConversation = useCallback(async () => {
    const result = await parseWithAdapters({
      type: "ext",
      document,
      url: window.location.href,
    });
    return result.conversation;
  }, []);

  return (
    <EditorDataProvider
      parseConversation={handleParseConversation}
      exportConversation={exportConversation}
    >
      <FloatingButton onClick={onOpenPanel} visible={!isPanelOpen} />
      <EditorModal
        mountedTo={getChat2posterBodyNode()}
        open={isPanelOpen}
        onOpenChange={onOpenChange}
        canvasRef={canvasRef}
      />
    </EditorDataProvider>
  );
}
