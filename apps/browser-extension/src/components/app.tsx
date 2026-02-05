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
  const currentUrlRef = useRef(currentUrl);
  const lastUrlRef = useRef<string | null>(null);
  const lastOpenRef = useRef(isPanelOpen);

  useEffect(() => {
    currentUrlRef.current = currentUrl;
  }, [currentUrl]);

  const handleParseConversation = useCallback(async () => {
    let attempt = 0;
    let url = window.location.href;
    let lastConversation:
      | Awaited<ReturnType<typeof parseWithAdapters>>["conversation"]
      | null = null;

    while (attempt < 2) {
      attempt += 1;
      const result = await parseWithAdapters({
        type: "ext",
        document,
        url,
      });
      lastConversation = result.conversation;
      if (url === window.location.href) {
        return result.conversation;
      }
      url = window.location.href;
    }

    if (lastConversation) {
      return lastConversation;
    }

    throw new Error("Failed to parse conversation for current URL");
  }, []);

  const handleOpenPanel = useCallback(() => {
    dispatch({ type: "CLEAR_CONVERSATION" });
    runtimeDispatch({ type: "SET_ERROR", payload: null });
    onOpenPanel();
  }, [dispatch, onOpenPanel, runtimeDispatch]);

  useEffect(() => {
    if (lastUrlRef.current === currentUrl) return;
    lastUrlRef.current = currentUrl;
    dispatch({ type: "CLEAR_CONVERSATION" });
    runtimeDispatch({ type: "SET_ERROR", payload: null });
  }, [currentUrl, dispatch, runtimeDispatch]);

  useEffect(() => {
    if (lastOpenRef.current === isPanelOpen) return;
    lastOpenRef.current = isPanelOpen;
    if (!isPanelOpen) return;
    dispatch({ type: "CLEAR_CONVERSATION" });
    runtimeDispatch({ type: "SET_ERROR", payload: null });
  }, [dispatch, isPanelOpen, runtimeDispatch]);

  return (
    <EditorDataProvider
      parseConversation={handleParseConversation}
      exportConversation={exportConversation}
    >
      <FloatingButton
        onClick={handleOpenPanel}
        visible={!isPanelOpen && Boolean(activeSite)}
      />
      <EditorModal
        mountedTo={getChat2posterBodyNode()}
        open={isPanelOpen}
        onOpenChange={onOpenChange}
        canvasRef={canvasRef}
        forceParseOnOpen
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
