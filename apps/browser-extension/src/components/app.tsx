import {
  getExtensionSiteByUrl,
  parseWithAdapters,
  registerBuiltinAdapters,
} from "@chat2poster/core-adapters";
import {
  EditorDataProvider,
  EditorModal,
  EditorProvider,
  FloatingButton,
  I18nProvider,
  useEditor,
  useConversationExport,
} from "@chat2poster/shared-ui";
import { getLocaleFromNavigator } from "@chat2poster/shared-ui/i18n/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChat2posterBodyNode } from "../lib/utils";
import { EXTENSION_WINDOW_EVENT } from "~/constants/extension-runtime";

registerBuiltinAdapters();

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const currentUrl = useExtensionUrl();
  const activeSite = useMemo(
    () => getExtensionSiteByUrl(currentUrl),
    [currentUrl],
  );
  const canOpenPanel = Boolean(activeSite);
  const locale =
    typeof navigator !== "undefined"
      ? getLocaleFromNavigator(
          navigator.languages.length > 0
            ? navigator.languages
            : navigator.language,
        )
      : "en";

  const handleOpenPanel = useCallback(() => {
    if (!canOpenPanel) return;
    setIsPanelOpen(true);
  }, [canOpenPanel]);

  useEffect(() => {
    if (!canOpenPanel && isPanelOpen) {
      setIsPanelOpen(false);
    }
  }, [canOpenPanel, isPanelOpen]);

  useEffect(() => {
    const handleToggle = () => {
      if (!canOpenPanel) return;
      setIsPanelOpen((prev) => !prev);
    };
    const handleOpen = () => {
      if (!canOpenPanel) return;
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
  }, [canOpenPanel]);

  return (
    <I18nProvider locale={locale}>
      <EditorProvider>
        <ExtensionShell
          isPanelOpen={isPanelOpen}
          onOpenPanel={handleOpenPanel}
          onOpenChange={setIsPanelOpen}
          currentUrl={currentUrl}
          activeSite={activeSite}
        />
      </EditorProvider>
    </I18nProvider>
  );
}

function ExtensionShell({
  isPanelOpen,
  onOpenPanel,
  onOpenChange,
  currentUrl,
  activeSite,
}: {
  isPanelOpen: boolean;
  onOpenPanel: () => void;
  onOpenChange: (open: boolean) => void;
  currentUrl: string;
  activeSite: ReturnType<typeof getExtensionSiteByUrl>;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { exportConversation } = useConversationExport({ canvasRef });
  const { dispatch, runtimeDispatch } = useEditor();
  const conversationId = useMemo(
    () => activeSite?.getConversationId(currentUrl) ?? null,
    [activeSite, currentUrl],
  );
  const lastConversationIdRef = useRef<string | null>(null);

  const handleParseConversation = useCallback(async () => {
    const result = await parseWithAdapters({
      type: "ext",
      document,
      url: currentUrl,
    });
    return result.conversation;
  }, [currentUrl]);

  useEffect(() => {
    if (lastConversationIdRef.current === conversationId) return;
    lastConversationIdRef.current = conversationId;
    dispatch({ type: "CLEAR_CONVERSATION" });
    runtimeDispatch({ type: "SET_ERROR", payload: null });
  }, [conversationId, dispatch, runtimeDispatch]);

  return (
    <EditorDataProvider
      parseConversation={handleParseConversation}
      exportConversation={exportConversation}
    >
      <FloatingButton
        onClick={onOpenPanel}
        visible={!isPanelOpen && Boolean(activeSite)}
      />
      <EditorModal
        mountedTo={getChat2posterBodyNode()}
        open={isPanelOpen}
        onOpenChange={onOpenChange}
        canvasRef={canvasRef}
      />
    </EditorDataProvider>
  );
}

function useExtensionUrl() {
  const [url, setUrl] = useState(
    typeof window !== "undefined" ? window.location.href : "",
  );

  useEffect(() => {
    const handleUrlChange = (event: Event) => {
      const detail = (event as CustomEvent<{ url?: string }>).detail;
      if (detail?.url) {
        setUrl(detail.url);
        return;
      }
      setUrl(window.location.href);
    };

    window.addEventListener(
      EXTENSION_WINDOW_EVENT.URL_CHANGE,
      handleUrlChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        EXTENSION_WINDOW_EVENT.URL_CHANGE,
        handleUrlChange as EventListener,
      );
    };
  }, []);

  return url;
}
